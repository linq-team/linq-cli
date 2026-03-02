import http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import { z } from "zod";
import { WEBHOOK_EVENT_TYPES } from "../../constants.js";

const MAX_EVENTS = 500;

interface WebhookEvent {
  received_at: string;
  payload: unknown;
}

let httpServer: http.Server | null = null;
let eventQueue: WebhookEvent[] = [];
let subscriptionId: string | null = null;

function summarizeEvent(payload: Record<string, unknown>): string {
  const type = payload.type ?? payload.event_type ?? "unknown";
  const data = payload.data as Record<string, unknown> | undefined;
  if (data) {
    const from = data.from ?? data.sender ?? "";
    if (from) return `Webhook event: ${type} from ${from}`;
  }
  return `Webhook event: ${type}`;
}

export function registerWebhookListenerTools(
  server: McpServer,
  client: Linq
): void {
  server.registerTool(
    "webhook-listener-start",
    {
      title: "Start Webhook Listener",
      description:
        "Start a local HTTP server to receive Linq webhook events. Requires a public-facing URL (e.g. from ngrok) that tunnels to the local port.",
      inputSchema: {
        port: z.number().default(3456).describe("Local port to listen on"),
        public_url: z
          .string()
          .describe(
            "Public-facing URL (e.g. ngrok/cloudflare tunnel) that forwards to the local port"
          ),
        events: z
          .array(z.enum(WEBHOOK_EVENT_TYPES))
          .default(["message.received"])
          .describe("Event types to subscribe to"),
      },
    },
    async ({ port, public_url, events }) => {
      if (httpServer) {
        return {
          content: [
            {
              type: "text",
              text: "Webhook listener is already running. Stop it first with webhook-listener-stop.",
            },
          ],
          isError: true,
        };
      }

      try {
        // Start HTTP server
        httpServer = http.createServer((req, res) => {
          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk: Buffer) => {
              body += chunk.toString();
            });
            req.on("end", () => {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true }));

              try {
                const payload = JSON.parse(body);
                const event: WebhookEvent = {
                  received_at: new Date().toISOString(),
                  payload,
                };

                eventQueue.push(event);
                if (eventQueue.length > MAX_EVENTS) {
                  eventQueue = eventQueue.slice(-MAX_EVENTS);
                }

                const summary = summarizeEvent(payload);
                server.server.sendLoggingMessage({
                  level: "info",
                  data: summary,
                });
              } catch {
                // Ignore malformed JSON
              }
            });
          } else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Linq webhook listener active");
          }
        });

        await new Promise<void>((resolve, reject) => {
          httpServer!.listen(port, () => resolve());
          httpServer!.on("error", reject);
        });

        // Create Linq webhook subscription
        const result = await client.webhooks.subscriptions.create({
          target_url: public_url,
          subscribed_events: events,
        } as Parameters<typeof client.webhooks.subscriptions.create>[0]);

        const sub = result as unknown as Record<string, unknown>;
        subscriptionId = (sub.id ?? sub.subscription_id ?? null) as
          | string
          | null;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "running",
                  port,
                  public_url,
                  subscription_id: subscriptionId,
                  subscribed_events: events,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (e) {
        // Clean up on failure
        if (httpServer) {
          httpServer.close();
          httpServer = null;
        }
        return {
          content: [
            {
              type: "text",
              text: `Error starting webhook listener: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "webhook-listener-stop",
    {
      title: "Stop Webhook Listener",
      description:
        "Stop the local webhook listener, delete the auto-created webhook subscription, and clear queued events.",
      inputSchema: {},
    },
    async () => {
      if (!httpServer) {
        return {
          content: [
            { type: "text", text: "Webhook listener is not running." },
          ],
          isError: true,
        };
      }

      const errors: string[] = [];

      // Delete the webhook subscription
      if (subscriptionId) {
        try {
          await client.webhooks.subscriptions.delete(subscriptionId);
        } catch (e) {
          errors.push(
            `Failed to delete webhook subscription ${subscriptionId}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }

      // Close the HTTP server
      await new Promise<void>((resolve) => {
        httpServer!.close(() => resolve());
      });

      const eventCount = eventQueue.length;
      httpServer = null;
      subscriptionId = null;
      eventQueue = [];

      const message = `Webhook listener stopped. ${eventCount} queued events cleared.`;
      return {
        content: [
          {
            type: "text",
            text: errors.length
              ? `${message}\nWarnings:\n${errors.join("\n")}`
              : message,
          },
        ],
      };
    }
  );

  server.registerTool(
    "webhook-listener-events",
    {
      title: "Get Webhook Events",
      description: "Retrieve queued webhook events received by the listener.",
      inputSchema: {
        limit: z
          .number()
          .default(20)
          .describe("Maximum number of events to return"),
        clear: z
          .boolean()
          .default(true)
          .describe("Remove returned events from the queue"),
      },
    },
    async ({ limit, clear }) => {
      const events = eventQueue.slice(0, limit);

      if (clear) {
        eventQueue = eventQueue.slice(events.length);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                count: events.length,
                remaining: eventQueue.length,
                listener_active: httpServer !== null,
                events,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
