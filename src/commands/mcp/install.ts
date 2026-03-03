import { Flags } from '@oclif/core';
import { resolve } from 'node:path';
import { BaseCommand } from '../../lib/base-command.js';
import {
  type AiClient,
  detectInstalledClients,
  readConfig,
  writeConfig,
  resolveLinqCommand,
  makeCustomClient,
} from '../../lib/mcp/clients.js';

export default class McpInstall extends BaseCommand {
  static override description = 'Install Linq as an MCP server in detected AI clients';

  static override examples = [
    '<%= config.bin %> mcp install',
    '<%= config.bin %> mcp install --path ~/.windsurf/mcp_config.json',
  ];

  static override flags = {
    path: Flags.string({
      description: 'Path to an MCP config file (for any AI client)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(McpInstall);

    let clients: AiClient[];

    if (flags.path) {
      clients = [makeCustomClient(resolve(flags.path))];
    } else {
      clients = detectInstalledClients();
      if (clients.length === 0) {
        this.log('No supported AI clients detected. Use --path to specify a config file.');
        return;
      }
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
