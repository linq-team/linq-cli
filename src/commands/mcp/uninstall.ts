import { BaseCommand } from '../../lib/base-command.js';
import {
  detectInstalledClients,
  readConfig,
  writeConfig,
} from '../../lib/mcp/clients.js';

export default class McpUninstall extends BaseCommand {
  static override description = 'Remove Linq MCP server from detected AI clients';

  static override examples = ['<%= config.bin %> mcp uninstall'];

  async run(): Promise<void> {
    await this.parse(McpUninstall);
    const clients = detectInstalledClients();

    if (clients.length === 0) {
      this.log('No supported AI clients detected.');
      return;
    }

    for (const client of clients) {
      const config = readConfig(client);
      const removed = client.removeServerEntry(config);

      if (!removed) {
        this.log(`${client.name}: not configured, skipping`);
        continue;
      }

      writeConfig(client, config);
      this.log(`${client.name}: removed (${client.configPath})`);
    }
  }
}
