import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { parseApiError } from '../../lib/errors.js';

export default class WebhooksEvents extends Command {
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
    const client = createLinqClient(token);

    try {
      const data = await client.webhooks.listWebhookEvents();
      this.log(JSON.stringify(data, null, 2));
    } catch (err) {
      this.error(`Failed to list webhook events: ${parseApiError(err)}`);
    }
  }
}
