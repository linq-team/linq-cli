import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatDeleted } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

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
    const client = createLinqClient(token);

    try {
      await client.webhooks.deleteWebhookSubscription(args.subscriptionId);

      if (flags.json) {
        this.log(JSON.stringify({ deleted: true, subscriptionId: args.subscriptionId }));
      } else {
        this.log(formatDeleted('Webhook', args.subscriptionId));
      }
    } catch (err) {
      this.error(`Failed to delete webhook: ${parseApiError(err)}`);
    }
  }
}
