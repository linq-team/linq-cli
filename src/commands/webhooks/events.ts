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

    try {
      const data = await client.webhooks.events.list();
      this.log(JSON.stringify(data, null, 2));
    } catch (e) {
      this.error(`Failed to list webhook events: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
