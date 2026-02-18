import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatWebhooksList } from '../../lib/format.js';

export default class WebhooksList extends BaseCommand {
  static override description = 'List all webhook subscriptions';

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
    const { flags } = await this.parse(WebhooksList);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.webhooks.subscriptions.list();

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatWebhooksList(data));
      }
    } catch (e) {
      this.error(`Failed to list webhooks: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
