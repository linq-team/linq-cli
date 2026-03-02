import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import { z } from "zod";
import { WEBHOOK_EVENT_TYPES } from "../../constants.js";

export function registerWebhookTools(server: McpServer, client: Linq): void {
  server.registerTool(
    "webhooks-create",
    {
      title: "Create Webhook",
      description:
        "Create a new webhook subscription to receive event notifications.",
      inputSchema: {
        target_url: z
          .string()
          .describe("HTTPS URL to receive webhook events"),
        subscribed_events: z
          .array(z.enum(WEBHOOK_EVENT_TYPES))
          .describe(
            "List of event types to subscribe to (e.g., message.sent, message.received)"
          ),
      },
    },
    async ({ target_url, subscribed_events }) => {
      try {
        const result = await client.webhooks.subscriptions.create({
          target_url,
          subscribed_events,
        } as Parameters<typeof client.webhooks.subscriptions.create>[0]);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating webhook: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "webhooks-list",
    {
      title: "List Webhooks",
      description: "List all webhook subscriptions.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await client.webhooks.subscriptions.list();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing webhooks: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "webhooks-get",
    {
      title: "Get Webhook",
      description: "Retrieve details of a specific webhook subscription.",
      inputSchema: {
        subscription_id: z.string().describe("The webhook subscription ID"),
      },
    },
    async ({ subscription_id }) => {
      try {
        const result =
          await client.webhooks.subscriptions.retrieve(subscription_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving webhook: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "webhooks-update",
    {
      title: "Update Webhook",
      description:
        "Update a webhook subscription's URL, events, or active status.",
      inputSchema: {
        subscription_id: z.string().describe("The webhook subscription ID"),
        target_url: z
          .string()
          .optional()
          .describe("New HTTPS URL for the webhook"),
        subscribed_events: z
          .array(z.enum(WEBHOOK_EVENT_TYPES))
          .optional()
          .describe("New list of event types to subscribe to"),
        is_active: z
          .boolean()
          .optional()
          .describe("Whether the webhook is active"),
      },
    },
    async ({ subscription_id, target_url, subscribed_events, is_active }) => {
      try {
        const body: Record<string, unknown> = {};
        if (target_url !== undefined) body.target_url = target_url;
        if (subscribed_events !== undefined)
          body.subscribed_events = subscribed_events;
        if (is_active !== undefined) body.is_active = is_active;

        const result = await client.webhooks.subscriptions.update(
          subscription_id,
          body as Parameters<typeof client.webhooks.subscriptions.update>[1]
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating webhook: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "webhooks-delete",
    {
      title: "Delete Webhook",
      description: "Delete a webhook subscription.",
      inputSchema: {
        subscription_id: z.string().describe("The webhook subscription ID"),
      },
    },
    async ({ subscription_id }) => {
      try {
        await client.webhooks.subscriptions.delete(subscription_id);
        return {
          content: [
            {
              type: "text",
              text: `Webhook ${subscription_id} deleted.`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting webhook: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
