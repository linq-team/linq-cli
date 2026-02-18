import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatLogLine } from '../../lib/webhook-format.js';
import type Linq from '@linqapp/sdk';

type WebhookEventType = Linq.Webhooks.SubscriptionCreateParams['subscribed_events'][number];

interface WebhookEvent {
  event_type?: string;
  [key: string]: unknown;
}

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
  'phone_number.status_updated',
];

const DEFAULT_WS_URL = 'wss://9r8ugjg4s0.execute-api.us-east-1.amazonaws.com/prod';
const DEFAULT_RELAY_URL = 'https://webhook.linqapp.com';
const MAX_RECONNECT_DELAY = 30_000;

export default class WebhooksListen extends BaseCommand {
  static override description =
    'Listen for webhook events';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --events message.received,message.sent',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    events: Flags.string({
      description:
        'Comma-separated list of events to subscribe to (default: all)',
    }),
    profile: Flags.string({
      description: 'Config profile to use',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
    json: Flags.boolean({
      description: 'Output raw JSON instead of structured log format',
      default: false,
    }),
  };

  private webhookId: string | null = null;
  private client: ReturnType<typeof createApiClient> | null = null;
  private ws: WebSocket | null = null;
  private shuttingDown = false;

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksListen);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    this.client = createApiClient(token);

    // Validate events if specified
    let subscribedEvents: WebhookEventType[];
    if (flags.events) {
      const eventList = flags.events.split(',').map((e) => e.trim());
      for (const event of eventList) {
        if (!WEBHOOK_EVENTS.includes(event as WebhookEventType)) {
          this.error(
            `Invalid event: ${event}. Valid events: ${WEBHOOK_EVENTS.join(', ')}`
          );
        }
      }
      subscribedEvents = eventList as WebhookEventType[];
    } else {
      subscribedEvents = [...WEBHOOK_EVENTS];
    }

    const eventFilter = flags.events?.split(',').map((e) => e.trim()) || null;

    const wsUrl = process.env.LINQ_RELAY_WS_URL || DEFAULT_WS_URL;
    const relayUrl = process.env.LINQ_RELAY_URL || DEFAULT_RELAY_URL;

    // Handle shutdown on any exit signal
    const shutdown = async () => {
      this.log('\nShutting down...');
      await this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);
    process.on('SIGQUIT', shutdown);
    process.on('uncaughtException', async (error) => {
      this.logToStderr(`Fatal error: ${error.message}`);
      await this.cleanup();
      process.exit(1);
    });
    process.on('unhandledRejection', async (reason) => {
      this.logToStderr(`Unhandled rejection: ${reason}`);
      await this.cleanup();
      process.exit(1);
    });

    try {
      this.log('Connecting to relay...');
      const connectionId = await this.connectWebSocket(wsUrl, token);
      this.log('Connected to relay');

      // Create webhook subscription pointing to relay
      const webhookTarget = `${relayUrl}/relay/${connectionId}`;
      await this.createWebhook(webhookTarget, subscribedEvents);

      this.log('');
      this.log('Listening for events... (Ctrl+C to stop)');
      this.log('');

      // Listen for events with auto-reconnect
      await this.listenLoop(wsUrl, token, relayUrl, subscribedEvents, eventFilter, flags.json);
    } catch (error) {
      if (this.shuttingDown) return;
      await this.cleanup();
      throw error;
    }
  }

  private connectWebSocket(wsUrl: string, token: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = `${wsUrl}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      this.ws = ws;

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timed out'));
      }, 10_000);

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ action: 'init' }));
      });

      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(typeof event.data === 'string' ? event.data : '');
          if (data.connectionId) {
            clearTimeout(timeout);
            resolve(data.connectionId);
          }
        } catch {
          // Ignore malformed messages during init
        }
      });

      ws.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Failed to connect to relay'));
      });

      ws.addEventListener('close', (event) => {
        clearTimeout(timeout);
        if (event.code === 4001) {
          reject(new Error('Authentication failed. Check your API token.'));
        }
      });
    });
  }

  private async listenLoop(
    wsUrl: string,
    token: string,
    relayUrl: string,
    subscribedEvents: WebhookEventType[],
    eventFilter: string[] | null,
    jsonOutput: boolean
  ): Promise<void> {
    let reconnectDelay = 1000;

    this.setupMessageHandler(eventFilter, jsonOutput);

    while (!this.shuttingDown) {
      // Wait for WebSocket to close
      await new Promise<void>((resolve) => {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          resolve();
          return;
        }
        this.ws.addEventListener('close', () => resolve(), { once: true });
      });

      if (this.shuttingDown) return;

      this.log(`Disconnected. Reconnecting in ${reconnectDelay / 1000}s...`);
      await new Promise((r) => setTimeout(r, reconnectDelay));
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);

      if (this.shuttingDown) return;

      try {
        const connectionId = await this.connectWebSocket(wsUrl, token);
        this.log('Reconnected to relay');
        reconnectDelay = 1000;

        // Update webhook target with new connectionId
        const webhookTarget = `${relayUrl}/relay/${connectionId}`;
        await this.updateWebhookTarget(webhookTarget);

        this.setupMessageHandler(eventFilter, jsonOutput);
      } catch (error) {
        if (this.shuttingDown) return;
        this.log(`Reconnect failed: ${(error as Error).message}`);
      }
    }
  }

  private setupMessageHandler(eventFilter: string[] | null, jsonOutput: boolean): void {
    if (!this.ws) return;

    this.ws.addEventListener('message', (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : '';
        const data = JSON.parse(raw) as WebhookEvent;

        // Skip init response
        if ('connectionId' in data) return;

        // Apply event filter
        if (eventFilter && data.event_type && !eventFilter.includes(data.event_type)) {
          return;
        }

        if (jsonOutput) {
          this.log(JSON.stringify(data, null, 2));
        } else {
          this.log(formatLogLine(data));
        }
      } catch {
        this.logToStderr(`Warning: received unparseable message: ${String(event.data).slice(0, 200)}`);
      }
    });
  }

  private async createWebhook(
    webhookUrl: string,
    subscribedEvents: WebhookEventType[]
  ): Promise<void> {
    try {
      const data = await this.client!.webhooks.subscriptions.create({
        target_url: webhookUrl,
        subscribed_events: subscribedEvents,
      });

      this.webhookId = data.id;
      this.log(`Webhook created: ${data.id}`);
      this.log(`URL: ${data.target_url}`);
      this.log(`Events: ${data.subscribed_events.join(', ')}`);
    } catch (e) {
      this.error(`Failed to create webhook: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private async updateWebhookTarget(webhookUrl: string): Promise<void> {
    if (!this.webhookId || !this.client) return;

    try {
      await this.client.webhooks.subscriptions.update(this.webhookId, {
        target_url: webhookUrl,
      });
    } catch (e) {
      this.log(`Warning: Failed to update webhook target: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private cleanupDone = false;

  private async cleanup(): Promise<void> {
    if (this.cleanupDone) return;
    this.cleanupDone = true;
    this.shuttingDown = true;

    // Close WebSocket
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
    }

    // Delete webhook subscription
    if (this.webhookId && this.client) {
      try {
        await this.client.webhooks.subscriptions.delete(this.webhookId);
        this.log(`Webhook ${this.webhookId} deleted`);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
