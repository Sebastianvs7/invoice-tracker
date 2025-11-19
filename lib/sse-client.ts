/**
 * SSE Client utility for handling Server-Sent Events with POST requests
 * Since EventSource doesn't support POST, we use fetch with ReadableStream
 */

export interface SSEProgressEvent {
  processed: number;
  total: number;
  currentInvoiceId: string;
}

export interface SSECompleteEvent {
  success: boolean;
  processed: number;
  total: number;
  errors?: Array<{ invoiceId: string; error: string }>;
}

export interface SSEErrorEvent {
  message: string;
  details?: unknown;
}

export interface SSEHandlers {
  onProgress?: (data: SSEProgressEvent) => void;
  onComplete?: (data: SSECompleteEvent) => void;
  onError?: (data: SSEErrorEvent) => void;
}

/**
 * Connect to SSE endpoint using POST request
 * @param url - The SSE endpoint URL
 * @param body - The request body to send
 * @param handlers - Event handlers for progress, complete, and error events
 * @returns Cleanup function to abort the connection
 */
export function connectSSE(
  url: string,
  body: unknown,
  handlers: SSEHandlers
): () => void {
  const abortController = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async function start() {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!response.ok) {
        handlers.onError?.({
          message: `HTTP error: ${response.status} ${response.statusText}`,
        });
        return;
      }

      if (!response.body) {
        handlers.onError?.({
          message: "Response body is null",
        });
        return;
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent: string | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split("\n");
          currentEvent = null;
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.substring(6).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);

              if (currentEvent === "progress") {
                handlers.onProgress?.(data as SSEProgressEvent);
              } else if (currentEvent === "complete") {
                handlers.onComplete?.(data as SSECompleteEvent);
                break;
              } else if (currentEvent === "error") {
                handlers.onError?.(data as SSEErrorEvent);
                break;
              }
            } catch (e) {
              // Ignore JSON parse errors
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Connection was aborted, ignore
        return;
      }
      handlers.onError?.({
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      reader?.releaseLock();
    }
  }

  // Start the connection
  start();

  // Return cleanup function
  return () => {
    abortController.abort();
    reader?.releaseLock();
  };
}

