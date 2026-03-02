import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BaseCommand } from '../../lib/base-command.js';
import { createDynamicClient } from '../../lib/api-client.js';
import { registerChatTools } from '../../lib/mcp/tools/chats.js';
import { registerMessageTools } from '../../lib/mcp/tools/messages.js';
import { registerWebhookTools } from '../../lib/mcp/tools/webhooks.js';
import { registerAttachmentTools } from '../../lib/mcp/tools/attachments.js';
import { registerPhoneNumberTools } from '../../lib/mcp/tools/phone-numbers.js';
import { registerWebhookListenerTools } from '../../lib/mcp/tools/webhook-listener.js';
import { registerProfileTools } from '../../lib/mcp/tools/profiles.js';
import { registerDoctorTools } from '../../lib/mcp/tools/doctor.js';

export default class Mcp extends BaseCommand {
  static override description =
    'Start the Linq MCP server (Model Context Protocol) for use with AI assistants like Claude';

  static override examples = [
    '<%= config.bin %> mcp',
  ];

  async run(): Promise<void> {
    const client = createDynamicClient();

    const server = new McpServer({
      name: 'linq',
      version: this.config.version,
    });

    registerChatTools(server, client);
    registerMessageTools(server, client);
    registerWebhookTools(server, client);
    registerAttachmentTools(server, client);
    registerPhoneNumberTools(server, client);
    registerWebhookListenerTools(server, client);
    registerProfileTools(server);
    registerDoctorTools(server, client);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Linq MCP server running (36 tools registered)');

    await new Promise<void>((resolve) => {
      const shutdown = async () => {
        await server.close();
        resolve();
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
  }
}
