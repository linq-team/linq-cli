import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksGet extends Command {
  static override description = 'Get a webhook subscription by ID';

  static override examples = [
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --json',
  ];

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
    json: Flags.boolean({
      description: 'Output response as JSON',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhooksGet);

    const config = await loadConfig();
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

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    // data IS the subscription directly
    this.log(`Webhook Subscription`);
    this.log(`  ID: ${data.id}`);
    this.log(`  URL: ${data.target_url}`);
    this.log(`  Active: ${data.is_active}`);
    this.log(`  Created: ${new Date(data.created_at).toLocaleString()}`);
    this.log(`  Updated: ${new Date(data.updated_at).toLocaleString()}`);
    this.log(`  Events:`);
    for (const event of data.subscribed_events) {
      this.log(`    - ${event}`);
    }
  }
}
