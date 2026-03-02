import { BaseCommand } from '../../lib/base-command.js';
import {
  detectInstalledClients,
  readConfig,
  writeConfig,
  resolveLinqCommand,
} from '../../lib/mcp/clients.js';

export default class McpInstall extends BaseCommand {
  static override description = 'Install Linq as an MCP server in detected AI clients';

  static override examples = [
    '<%= config.bin %> mcp install',
  ];

  async run(): Promise<void> {
    const clients = detectInstalledClients();

    if (clients.length === 0) {
      this.log('No supported AI clients detected.');
      return;
    }

    const entry = resolveLinqCommand();

    for (const client of clients) {
      const config = readConfig(client);
      const existing = client.getServerEntry(config);

      if (existing) {
        this.log(`${client.name}: already installed, skipping`);
        continue;
      }

      client.setServerEntry(config, entry);
      writeConfig(client, config);
      this.log(`${client.name}: installed (${client.configPath})`);
    }
  }
}
