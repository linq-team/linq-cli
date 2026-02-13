import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatWebhookDetail } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';
import type { WebhookEventType } from '@linqapp/sdk/models/components';

const WEBHOOK_EVENTS: WebhookEventType[] = [
  'message.sent',
  'message.received',
  'message.read',
  'message.delivered',
  'message.failed',
  'reaction.added',
  'reaction.removed',
  'participant.added',
  'participant.removed',
  'chat.created',
  'chat.group_name_updated',
  'chat.group_icon_updated',
  'chat.group_name_update_failed',
  'chat.group_icon_update_failed',
  'chat.typing_indicator.started',
  'chat.typing_indicator.stopped',
];

export default class WebhooksUpdate extends BaseCommand {
  static override description = 'Update a webhook subscription';

  static override examples = [
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --url https://new-url.com/webhook',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --events message.received,message.sent',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --deactivate',
  ];

  static override args = {
    subscriptionId: Args.string({
      description: 'Webhook subscription ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    url: Flags.string({
      description: 'New target URL for webhook events',
    }),
    events: Flags.string({
      description: 'Comma-separated list of events',
    }),
    activate: Flags.boolean({
      description: 'Activate the webhook subscription',
      exclusive: ['deactivate'],
    }),
    deactivate: Flags.boolean({
      description: 'Deactivate the webhook subscription',
      exclusive: ['activate'],
    }),
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
    const { args, flags } = await this.parse(WebhooksUpdate);

    if (!flags.url && !flags.events && !flags.activate && !flags.deactivate) {
      this.error('At least one of --url, --events, --activate, or --deactivate is required');
    }

    // Validate events if provided
    let subscribedEvents: WebhookEventType[] | undefined;
    if (flags.events) {
      const eventList = flags.events.split(',').map((e) => e.trim());
      for (const event of eventList) {
        if (!WEBHOOK_EVENTS.includes(event as WebhookEventType)) {
          this.error(`Invalid event: ${event}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`);
        }
      }
      subscribedEvents = eventList as WebhookEventType[];
    }

    // Determine isActive value
    let isActive: boolean | undefined;
    if (flags.activate) {
      isActive = true;
    } else if (flags.deactivate) {
      isActive = false;
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      const data = await client.webhooks.updateWebhookSubscription(
        args.subscriptionId,
        {
          targetUrl: flags.url,
          subscribedEvents,
          isActive,
        },
      );

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatWebhookDetail(data));
      }
    } catch (err) {
      this.error(`Failed to update webhook: ${parseApiError(err)}`);
    }
  }
}
