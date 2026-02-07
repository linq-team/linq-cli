import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksList extends Command {
  static override description = 'List all webhook subscriptions';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
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
      this.error(`Failed to list webhooks: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list webhooks: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
