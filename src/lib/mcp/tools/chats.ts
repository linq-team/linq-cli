import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import { z } from "zod";
import { buildMessageBody } from "../../constants.js";

export function registerChatTools(server: McpServer, client: Linq): void {
  server.registerTool(
    "chats-list",
    {
      title: "List Chats",
      description:
        "List all chat conversations for a phone number. Returns paginated results.",
      inputSchema: {
        from: z
          .string()
          .describe(
            "Sender phone number in E.164 format (e.g., +12025551234)"
          ),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Max results per page (1-100, default 20)"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from a previous response"),
      },
    },
    async ({ from, limit, cursor }) => {
      try {
        const result = await client.chats.list({ from, limit, cursor });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing chats: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-get",
    {
      title: "Get Chat",
      description: "Retrieve details of a specific chat conversation by ID.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to retrieve"),
      },
    },
    async ({ chat_id }) => {
      try {
        const result = await client.chats.retrieve(chat_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving chat: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-create",
    {
      title: "Create Chat",
      description:
        "Create a new chat conversation and send the first message. Supports iMessage effects.",
      inputSchema: {
        from: z
          .string()
          .describe("Sender phone number in E.164 format (e.g., +12025551234)"),
        to: z
          .array(z.string())
          .describe(
            "Recipient phone numbers or emails. Multiple recipients create a group chat."
          ),
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
      },
    },
    async ({ from, to, message, effect_type, effect_name }) => {
      try {
        const msgBody = buildMessageBody(message, {
          effectType: effect_type,
          effectName: effect_name,
        });

        const result = await client.chats.create({
          from,
          to,
          message: msgBody,
        } as Parameters<typeof client.chats.create>[0]);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating chat: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-update",
    {
      title: "Update Chat",
      description:
        "Update a chat conversation's display name or group icon.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to update"),
        display_name: z
          .string()
          .optional()
          .describe("New display name for the chat"),
        group_chat_icon: z
          .string()
          .optional()
          .describe("URL for the group chat icon"),
      },
    },
    async ({ chat_id, display_name, group_chat_icon }) => {
      try {
        const body: Record<string, unknown> = {};
        if (display_name !== undefined) body.display_name = display_name;
        if (group_chat_icon !== undefined)
          body.group_chat_icon = group_chat_icon;

        const result = await client.chats.update(
          chat_id,
          body as Parameters<typeof client.chats.update>[1]
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating chat: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-mark-read",
    {
      title: "Mark Chat as Read",
      description: "Mark all messages in a chat as read.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to mark as read"),
      },
    },
    async ({ chat_id }) => {
      try {
        await client.chats.markAsRead(chat_id);
        return {
          content: [
            { type: "text", text: `Chat ${chat_id} marked as read.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error marking chat as read: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-typing-start",
    {
      title: "Start Typing Indicator",
      description:
        "Send a typing indicator to show that someone is typing in the chat. Group chat typing indicators are not currently supported.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to start typing in"),
      },
    },
    async ({ chat_id }) => {
      try {
        await client.chats.typing.start(chat_id);
        return {
          content: [
            { type: "text", text: `Typing indicator started in chat ${chat_id}.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting typing indicator: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-typing-stop",
    {
      title: "Stop Typing Indicator",
      description:
        "Stop the typing indicator for the chat. Typing indicators are automatically stopped when a message is sent.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to stop typing in"),
      },
    },
    async ({ chat_id }) => {
      try {
        await client.chats.typing.stop(chat_id);
        return {
          content: [
            { type: "text", text: `Typing indicator stopped in chat ${chat_id}.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping typing indicator: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-send-voicememo",
    {
      title: "Send Voice Memo",
      description:
        "Send a voice memo audio file to a chat. The URL must be a publicly accessible HTTPS URL.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to send the voice memo to"),
        voice_memo_url: z
          .string()
          .describe(
            "URL of the voice memo audio file. Must be a publicly accessible HTTPS URL."
          ),
        from: z
          .string()
          .describe("Sender phone number in E.164 format (e.g., +12025551234)"),
      },
    },
    async ({ chat_id, voice_memo_url, from }) => {
      try {
        const result = await client.chats.sendVoicememo(chat_id, {
          voice_memo_url,
          from,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending voice memo: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-share-contact",
    {
      title: "Share Contact Card",
      description:
        "Share your contact information (Name and Photo Sharing) with a chat. A contact card must be configured on the Linq dashboard before sharing.",
      inputSchema: {
        chat_id: z.string().describe("The chat ID to share your contact card with"),
      },
    },
    async ({ chat_id }) => {
      try {
        await client.chats.shareContactCard(chat_id);
        return {
          content: [
            { type: "text", text: `Contact card shared in chat ${chat_id}.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error sharing contact card: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-participants-add",
    {
      title: "Add Participant",
      description:
        "Add a new participant to an existing group chat. Group chats only (3+ existing participants). The new participant must support the same messaging service as the group.",
      inputSchema: {
        chat_id: z.string().describe("The group chat ID"),
        handle: z
          .string()
          .describe(
            "Phone number (E.164 format) or email address of the participant to add"
          ),
      },
    },
    async ({ chat_id, handle }) => {
      try {
        const result = await client.chats.participants.add(chat_id, { handle });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error adding participant: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "chats-participants-remove",
    {
      title: "Remove Participant",
      description:
        "Remove a participant from an existing group chat. Must have 3+ participants after removal.",
      inputSchema: {
        chat_id: z.string().describe("The group chat ID"),
        handle: z
          .string()
          .describe(
            "Phone number (E.164 format) or email address of the participant to remove"
          ),
      },
    },
    async ({ chat_id, handle }) => {
      try {
        const result = await client.chats.participants.remove(chat_id, { handle });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error removing participant: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
