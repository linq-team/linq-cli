import { Command, Flags } from '@oclif/core';
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
      subscribedEvents = [...WEBHOOK_EVENTS];
    } else if (flags.events) {
      const eventList = flags.events.split(',').map((e) => e.trim());
      for (const event of eventList) {
        if (!WEBHOOK_EVENTS.includes(event as WebhookEventType)) {
          this.error(`Invalid event: ${event}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`);
        }
      }
      subscribedEvents = eventList as WebhookEventType[];
    } else {
      this.error('Either --events or --all-events is required');
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      const data = await client.webhooks.createWebhookSubscription({
        targetUrl: flags.url,
        subscribedEvents,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatWebhookDetail(data));
      }
    } catch (err) {
      this.error(`Failed to create webhook: ${parseApiError(err)}`);
    }
  }
}
