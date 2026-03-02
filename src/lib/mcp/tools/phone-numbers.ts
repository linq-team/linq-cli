import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";

export function registerPhoneNumberTools(
  server: McpServer,
  client: Linq
): void {
  server.registerTool(
    "phone-numbers-list",
    {
      title: "List Phone Numbers",
      description:
        "List all phone numbers available on your Linq account.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await client.phoneNumbers.list();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing phone numbers: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
