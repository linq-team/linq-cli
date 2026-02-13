import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatWebhooksList } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

export default class WebhooksList extends Command {
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
    const client = createLinqClient(token);

    try {
      const data = await client.webhooks.listWebhookSubscriptions();

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatWebhooksList(data));
      }
    } catch (err) {
      this.error(`Failed to list webhooks: ${parseApiError(err)}`);
    }
  }
}
