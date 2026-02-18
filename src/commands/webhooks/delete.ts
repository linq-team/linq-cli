import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatDeleted } from '../../lib/format.js';

export default class WebhooksDelete extends BaseCommand {
  static override description = 'Delete a webhook subscription';

  static override examples = ['<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID'];

  static override args = {
    subscriptionId: Args.string({
      description: 'Webhook subscription ID (UUID)',
      required: true,
    }),
  };

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
    const { args, flags } = await this.parse(WebhooksDelete);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      await client.webhooks.subscriptions.delete(args.subscriptionId);

      if (flags.json) {
        this.log(JSON.stringify({ deleted: true, subscriptionId: args.subscriptionId }));
      } else {
        this.log(formatDeleted('Webhook', args.subscriptionId));
      }
    } catch (e) {
      this.error(`Failed to delete webhook: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
