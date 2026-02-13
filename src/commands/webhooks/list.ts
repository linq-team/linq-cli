import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatWebhooksList } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

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

    const { data, error } = await client.GET('/v3/webhook-subscriptions');

    if (error) {
      this.error(`Failed to list webhooks: ${parseApiError(error)}`);
    }

    if (!data) {
      this.error('Failed to list webhooks: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      this.log(formatWebhooksList(data));
    }
  }
}
