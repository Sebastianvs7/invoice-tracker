import { NextRequest, NextResponse } from "next/server";
import { invoiceArraySchema } from "@/lib/validators/invoice";
import { processInvoiceData } from "@/lib/db/queries";
import type { InvoiceData } from "@/types";

// Configure route segment for longer timeout
export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";

function sendSSE(
  controller: ReadableStreamDefaultController,
  event: string,
  data: unknown
) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

function sendKeepAlive(controller: ReadableStreamDefaultController) {
  // Send a comment line to keep the connection alive
  controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
}

/**
 * Process invoices in parallel batches
 */
async function processBatch(
  invoices: InvoiceData[],
  batchSize: number = 15
): Promise<{
  succeeded: number;
  errors: Array<{ invoiceId: string; error: string }>;
}> {
  const results = {
    succeeded: 0,
    errors: [] as Array<{ invoiceId: string; error: string }>,
  };

  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map((invoice) => processInvoiceData(invoice))
    );

    // Collect results
    batchResults.forEach((result, index) => {
      const invoice = batch[index];
      if (result.status === "fulfilled") {
        results.succeeded++;
      } else {
        results.errors.push({
          invoiceId: invoice.id,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error occurred",
        });
      }
    });
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useSSE =
      request.headers.get("accept")?.includes("text/event-stream") ||
      request.nextUrl.searchParams.get("sse") === "true";

    // Validate the JSON structure
    const validationResult = invoiceArraySchema.safeParse(body);

    if (!validationResult.success) {
      if (useSSE) {
        const stream = new ReadableStream({
          start(controller) {
            sendSSE(controller, "error", {
              message: "Invalid invoice data structure",
              details: validationResult.error.errors,
            });
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      return NextResponse.json(
        {
          error: "Invalid invoice data structure",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const invoices = validationResult.data;

    // If SSE is requested, stream progress
    if (useSSE) {
      const stream = new ReadableStream({
        async start(controller) {
          const results = {
            processed: 0, // Total invoices processed (attempted)
            succeeded: 0, // Successfully processed invoices
            errors: [] as Array<{ invoiceId: string; error: string }>,
          };

          try {
            const batchSize = 10; // Reduced batch size to avoid overwhelming Supabase
            let lastKeepAlive = Date.now();
            const keepAliveInterval = 8000; // Send keep-alive every 8 seconds (very frequent)

            // Send initial keep-alive
            try {
              sendKeepAlive(controller);
            } catch (e) {
              console.error("Failed to send initial keep-alive:", e);
            }

            // Process in batches
            for (let i = 0; i < invoices.length; i += batchSize) {
              try {
                const batch = invoices.slice(i, i + batchSize);

                // Send keep-alive before each batch if needed
                const now = Date.now();
                if (now - lastKeepAlive > keepAliveInterval) {
                  try {
                    sendKeepAlive(controller);
                    lastKeepAlive = now;
                  } catch (e) {
                    // Stream might be closed, but continue processing
                    console.error("Failed to send keep-alive:", e);
                  }
                }

                // Process batch in parallel with timeout protection
                const batchStartTime = Date.now();
                const batchResults = await Promise.allSettled(
                  batch.map((invoice) =>
                    Promise.race([
                      processInvoiceData(invoice),
                      new Promise((_, reject) =>
                        setTimeout(
                          () => reject(new Error("Invoice processing timeout")),
                          30000
                        )
                      ),
                    ])
                  )
                );

                // Send keep-alive if batch took a long time
                const batchDuration = Date.now() - batchStartTime;
                if (batchDuration > keepAliveInterval) {
                  try {
                    sendKeepAlive(controller);
                    lastKeepAlive = Date.now();
                  } catch (e) {
                    console.error("Failed to send keep-alive after batch:", e);
                  }
                }

                // Update results and send progress
                batchResults.forEach((result, batchIndex) => {
                  const invoice = batch[batchIndex];

                  if (result.status === "fulfilled") {
                    results.succeeded++;
                  } else {
                    results.errors.push({
                      invoiceId: invoice.id,
                      error:
                        result.reason instanceof Error
                          ? result.reason.message
                          : "Unknown error occurred",
                    });
                  }

                  results.processed++;

                  // Send progress event for every invoice processed
                  try {
                    sendSSE(controller, "progress", {
                      processed: results.processed,
                      total: invoices.length,
                      currentInvoiceId: invoice.id,
                    });
                  } catch (e) {
                    // If stream is closed, log but continue processing
                    console.error("Failed to send progress event:", e);
                  }
                });

                // Small delay between batches to avoid overwhelming the database
                if (i + batchSize < invoices.length) {
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }
              } catch (batchError) {
                // If entire batch fails, log but continue with next batch
                console.error(
                  `Batch ${i}-${i + batchSize} failed:`,
                  batchError
                );
                // Mark all items in this batch as errors
                const batch = invoices.slice(i, i + batchSize);
                batch.forEach((invoice) => {
                  results.errors.push({
                    invoiceId: invoice.id,
                    error:
                      batchError instanceof Error
                        ? batchError.message
                        : "Batch processing failed",
                  });
                  results.processed++;
                  try {
                    sendSSE(controller, "progress", {
                      processed: results.processed,
                      total: invoices.length,
                      currentInvoiceId: invoice.id,
                    });
                  } catch (e) {
                    console.error(
                      "Failed to send progress after batch error:",
                      e
                    );
                  }
                });
              }
            }

            // Send completion event
            if (results.errors.length > 0 && results.succeeded === 0) {
              sendSSE(controller, "error", {
                message: "failedToProcessInvoices",
                details: results.errors,
              });
            } else {
              sendSSE(controller, "complete", {
                success: true,
                processed: results.succeeded,
                total: invoices.length,
                errors: results.errors.length > 0 ? results.errors : undefined,
              });
            }
          } catch (error) {
            sendSSE(controller, "error", {
              message: "failedToProcessUpload",
              details:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Original non-SSE behavior for backward compatibility (also uses batch processing)
    const batchResults = await processBatch(invoices);

    const results = {
      processed: batchResults.succeeded + batchResults.errors.length,
      errors: batchResults.errors,
    };

    if (results.errors.length > 0 && results.processed === 0) {
      // All failed
      return NextResponse.json(
        {
          error: "failedToProcessInvoices", // Translation key for frontend
          details: results.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: results.processed,
      total: invoices.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    if (
      request.headers.get("accept")?.includes("text/event-stream") ||
      request.nextUrl.searchParams.get("sse") === "true"
    ) {
      const stream = new ReadableStream({
        start(controller) {
          sendSSE(controller, "error", {
            message: "failedToProcessUpload", // Translation key for frontend
            details:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json(
      {
        error: "failedToProcessUpload", // Translation key for frontend
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
