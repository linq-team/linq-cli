import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksGet extends Command {
  static override description = 'Get a webhook subscription by ID';

  static override examples = ['<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID'];

  static override args = {
    subscriptionId: Args.string({
      description: 'Webhook subscription ID (UUID)',
      required: true,
    }),
  };

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
    const { args, flags } = await this.parse(WebhooksGet);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET(
      '/v3/webhook-subscriptions/{subscriptionId}',
      {
        params: {
          path: {
            subscriptionId: args.subscriptionId,
          },
        },
      }
    );

    if (error) {
      this.error(`Failed to get webhook: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get webhook: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
