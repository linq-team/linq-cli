import { Flags } from '@oclif/core';
import { resolve } from 'node:path';
import { BaseCommand } from '../../lib/base-command.js';
import {
  type AiClient,
  detectInstalledClients,
  readConfig,
  writeConfig,
  makeCustomClient,
} from '../../lib/mcp/clients.js';

export default class McpUninstall extends BaseCommand {
  static override description = 'Remove Linq MCP server from detected AI clients';

  static override examples = [
    '<%= config.bin %> mcp uninstall',
    '<%= config.bin %> mcp uninstall --path ~/.windsurf/mcp_config.json',
  ];

  static override flags = {
    path: Flags.string({
      description: 'Path to an MCP config file (for any AI client)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(McpUninstall);

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
