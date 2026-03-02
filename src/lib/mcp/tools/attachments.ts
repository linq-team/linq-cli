import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import { z } from "zod";

export function registerAttachmentTools(server: McpServer, client: Linq): void {
  server.registerTool(
    "attachments-create-upload-url",
    {
      title: "Create Attachment Upload URL",
      description:
        "Generate a presigned URL to upload an attachment. Use the returned URL to upload the file via HTTP PUT.",
      inputSchema: {
        filename: z.string().describe("Filename (e.g., photo.jpg)"),
        content_type: z
          .string()
          .describe("MIME type (e.g., image/jpeg, video/mp4)"),
        size_bytes: z.number().describe("File size in bytes"),
      },
    },
    async ({ filename, content_type, size_bytes }) => {
      try {
        const result = await client.attachments.create({
          filename,
          content_type,
          size_bytes,
        } as Parameters<typeof client.attachments.create>[0]);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating upload URL: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "attachments-get",
    {
      title: "Get Attachment",
      description: "Retrieve metadata for an attachment by ID.",
      inputSchema: {
        attachment_id: z.string().describe("The attachment ID to retrieve"),
      },
    },
    async ({ attachment_id }) => {
      try {
        const result = await client.attachments.retrieve(attachment_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving attachment: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
