import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

const WEBHOOK_EVENTS = [
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
] as const;

export default class WebhooksUpdate extends Command {
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
    const { args, flags } = await this.parse(WebhooksUpdate);

    if (!flags.url && !flags.events && !flags.activate && !flags.deactivate) {
      this.error('At least one of --url, --events, --activate, or --deactivate is required');
    }

    // Validate events if provided
    let subscribedEvents: string[] | undefined;
    if (flags.events) {
      subscribedEvents = flags.events.split(',').map((e) => e.trim());
      for (const event of subscribedEvents) {
        if (!WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number])) {
          this.error(`Invalid event: ${event}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`);
        }
      }
    }

    // Determine is_active value
    let isActive: boolean | undefined;
    if (flags.activate) {
      isActive = true;
    } else if (flags.deactivate) {
      isActive = false;
    }

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.PUT(
      '/v3/webhook-subscriptions/{subscriptionId}',
      {
        params: {
          path: {
            subscriptionId: args.subscriptionId,
          },
        },
        body: {
          target_url: flags.url,
          subscribed_events: subscribedEvents,
          is_active: isActive,
        },
      }
    );

    if (error) {
      this.error(`Failed to update webhook: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to update webhook: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    // data IS the subscription directly
    this.log(`Webhook subscription updated!`);
    this.log(`  ID: ${data.id}`);
    this.log(`  URL: ${data.target_url}`);
    this.log(`  Active: ${data.is_active}`);
    this.log(`  Events: ${data.subscribed_events.join(', ')}`);
  }
}
