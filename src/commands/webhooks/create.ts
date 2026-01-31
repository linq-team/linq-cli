import { Command, Flags } from '@oclif/core';
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

export default class WebhooksCreate extends Command {
  static override description = 'Create a new webhook subscription';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --url https://example.com/webhook --events message.received,message.sent',
    '<%= config.bin %> <%= command.id %> --url https://example.com/webhook --all-events',
  ];

  static override flags = {
    url: Flags.string({
      description: 'Target URL for webhook events (must be HTTPS)',
      required: true,
    }),
    events: Flags.string({
      description: `Comma-separated list of events to subscribe to`,
    }),
    'all-events': Flags.boolean({
      description: 'Subscribe to all event types',
      default: false,
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
    const { flags } = await this.parse(WebhooksCreate);

    // Validate events
    let subscribedEvents: string[];
    if (flags['all-events']) {
      subscribedEvents = [...WEBHOOK_EVENTS];
    } else if (flags.events) {
      subscribedEvents = flags.events.split(',').map((e) => e.trim());
      for (const event of subscribedEvents) {
        if (!WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number])) {
          this.error(`Invalid event: ${event}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`);
        }
      }
    } else {
      this.error('Either --events or --all-events is required');
    }

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.POST('/v3/webhook-subscriptions', {
      body: {
        target_url: flags.url,
        subscribed_events: subscribedEvents,
      },
    });

    if (error) {
      this.error(`Failed to create webhook: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to create webhook: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    // data fields are directly on data, not data.subscription
    this.log(`Webhook subscription created!`);
    this.log(`  ID: ${data.id}`);
    this.log(`  URL: ${data.target_url}`);
    this.log(`  Events: ${data.subscribed_events.join(', ')}`);
    this.log(`  Active: ${data.is_active}`);
    this.log(`\n  IMPORTANT: Save your signing secret (shown only once):`);
    this.log(`  ${data.signing_secret}`);
  }
}
