import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatWebhookDetail } from '../../lib/format.js';
import { WEBHOOK_EVENT_TYPES, type WebhookEventType } from '../../lib/constants.js';

export default class WebhooksCreate extends BaseCommand {
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
    const { flags } = await this.parse(WebhooksCreate);

    // Validate events
    let subscribedEvents: WebhookEventType[];
    if (flags['all-events']) {
      subscribedEvents = [...WEBHOOK_EVENT_TYPES];
    } else if (flags.events) {
      const eventList = flags.events.split(',').map((e) => e.trim());
      for (const event of eventList) {
        if (!WEBHOOK_EVENT_TYPES.includes(event as WebhookEventType)) {
          this.error(`Invalid event: ${event}. Valid events: ${WEBHOOK_EVENT_TYPES.join(', ')}`);
        }
      }
      subscribedEvents = eventList as WebhookEventType[];
    } else {
      this.error('Either --events or --all-events is required');
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.webhooks.subscriptions.create({
        target_url: flags.url,
        subscribed_events: subscribedEvents,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatWebhookDetail(data));
      }
    } catch (e) {
      this.error(`Failed to create webhook: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
