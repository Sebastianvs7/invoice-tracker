import { NextRequest, NextResponse } from "next/server";
import { invoiceArraySchema } from "@/lib/validators/invoice";
import { processInvoiceData } from "@/lib/db/queries";

function sendSSE(
  controller: ReadableStreamDefaultController,
  event: string,
  data: unknown
) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
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
            for (let i = 0; i < invoices.length; i++) {
              const invoice = invoices[i];
              try {
                await processInvoiceData(invoice);
                results.succeeded++;
              } catch (error) {
                results.errors.push({
                  invoiceId: invoice.id,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Unknown error occurred",
                });
              }

              // Always increment processed counter and send progress
              // This ensures progress bar moves forward even when invoices fail
              results.processed++;

              // Send progress event for every invoice processed
              sendSSE(controller, "progress", {
                processed: results.processed,
                total: invoices.length,
                currentInvoiceId: invoice.id,
              });
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

    // Original non-SSE behavior for backward compatibility
    const results = {
      processed: 0,
      errors: [] as Array<{ invoiceId: string; error: string }>,
    };

    for (const invoice of invoices) {
      try {
        await processInvoiceData(invoice);
        results.processed++;
      } catch (error) {
        results.errors.push({
          invoiceId: invoice.id,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

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
