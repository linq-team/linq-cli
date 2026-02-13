import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksEvents extends BaseCommand {
  static override description = 'List available webhook event types';

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
    const { flags } = await this.parse(WebhooksEvents);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/webhook-events');

    if (error) {
      this.error(`Failed to list webhook events: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list webhook events: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
