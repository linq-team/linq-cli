import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksDelete extends Command {
  static override description = 'Delete a webhook subscription';

  static override examples = ['<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID'];

  static override args = {
    subscriptionId: Args.string({
      description: 'Webhook subscription ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhooksDelete);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { error } = await client.DELETE(
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
      this.error(`Failed to delete webhook: ${JSON.stringify(error)}`);
    }

    this.log(`Webhook subscription ${args.subscriptionId} deleted successfully.`);
  }
}
