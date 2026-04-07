import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksEvents extends BaseCommand {
  static override description = 'List available webhook event types';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksEvents);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.webhooks.events.list();

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
        return;
      }

      const events = (data as any).events || [];
      if (events.length === 0) {
        this.log('\n  No webhook event types available.\n');
        return;
      }

      this.log(`\n  ${chalk.bold('Available webhook events')}\n`);
      for (const event of events) {
        if (typeof event === 'string') {
          this.log(`  ${event}`);
        } else {
          this.log(`  ${event.name || event.type || event}`);
        }
      }
      this.log('');
    } catch (e) {
      this.error(`Failed to list webhook events: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
