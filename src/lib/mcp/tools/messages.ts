import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import { z } from "zod";
import { buildMessageBody } from "../../constants.js";

export function registerMessageTools(server: McpServer, client: Linq): void {
  server.registerTool(
    "messages-send",
    {
      title: "Send Message",
      description:
        "Send a message in an existing chat. Supports iMessage effects and replies.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to send the message to"),
        message: z.string().describe("The text message to send"),
        effect_type: z
          .enum(["screen", "bubble"])
          .optional()
          .describe("iMessage effect type"),
        effect_name: z
          .string()
          .optional()
          .describe(
            "iMessage effect name. Screen: confetti, fireworks, lasers, sparkles, celebration, hearts, love, balloons, happy_birthday, echo, spotlight. Bubble: slam, loud, gentle, invisible"
          ),
        reply_to_message_id: z
          .string()
          .optional()
          .describe("Message ID to reply to (inline reply)"),
        reply_to_part_index: z
          .number()
          .optional()
          .describe("Part index of the message to reply to (default 0)"),
      },
    },
    async ({
      chat_id,
      message,
      effect_type,
      effect_name,
      reply_to_message_id,
      reply_to_part_index,
    }) => {
      try {
        const msgBody = buildMessageBody(message, {
          effectType: effect_type,
          effectName: effect_name,
          replyToMessageId: reply_to_message_id,
          replyToPartIndex: reply_to_part_index,
        });

        const result = await client.chats.messages.send(
          chat_id,
          { message: msgBody } as Parameters<
            typeof client.chats.messages.send
          >[1]
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending message: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "messages-list",
    {
      title: "List Messages",
      description: "List messages in a chat conversation. Returns paginated results.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to list messages for"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max results per page (1-100, default 50)"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from a previous response"),
      },
    },
    async ({ chat_id, limit, cursor }) => {
      try {
        const result = await client.chats.messages.list(chat_id, {
          limit,
          cursor,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing messages: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "messages-get",
    {
      title: "Get Message",
      description: "Retrieve a specific message by ID.",
      inputSchema: {
        message_id: z.string().describe("The message ID to retrieve"),
      },
    },
    async ({ message_id }) => {
      try {
        const result = await client.messages.retrieve(message_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving message: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "messages-react",
    {
      title: "React to Message",
      description: "Add or remove a reaction (tapback) on a message.",
      inputSchema: {
        message_id: z.string().describe("The message ID to react to"),
        operation: z
          .enum(["add", "remove"])
          .describe("Whether to add or remove the reaction"),
        type: z
          .enum([
            "love",
            "like",
            "dislike",
            "laugh",
            "emphasize",
            "question",
            "custom",
          ])
          .describe("Reaction type"),
        custom_emoji: z
          .string()
          .optional()
          .describe("Custom emoji (required when type is 'custom')"),
        part_index: z
          .number()
          .optional()
          .describe("Index of the message part to react to (default 0)"),
      },
    },
    async ({ message_id, operation, type, custom_emoji, part_index }) => {
      try {
        const result = await client.messages.addReaction(
          message_id,
          {
            operation,
            type,
            custom_emoji,
            part_index: part_index ?? 0,
          } as Parameters<typeof client.messages.addReaction>[1]
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error reacting to message: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "messages-delete",
    {
      title: "Delete Message",
      description: "Delete a message from a chat.",
      inputSchema: {
        message_id: z.string().describe("The message ID to delete"),
        chat_id: z
          .string()
          .describe("The chat ID the message belongs to"),
      },
    },
    async ({ message_id, chat_id }) => {
      try {
        await client.messages.delete(message_id, { chat_id });
        return {
          content: [
            { type: "text", text: `Message ${message_id} deleted.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting message: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "messages-thread",
    {
      title: "Get Message Thread",
      description:
        "Retrieve the thread of replies for a message. Returns paginated results.",
      inputSchema: {
        message_id: z.string().describe("The message ID to get the thread for"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max results per page"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from a previous response"),
        order: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort order (default desc)"),
      },
    },
    async ({ message_id, limit, cursor, order }) => {
      try {
        const result = await client.messages.retrieveThread(message_id, {
          limit,
          cursor,
          order,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving thread: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
