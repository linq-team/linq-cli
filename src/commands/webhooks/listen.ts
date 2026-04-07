import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatLogLine } from '../../lib/webhook-format.js';
import * as crypto from 'node:crypto';
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
  static override description = 'Listen for webhook events and optionally forward to a local server';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --events message.received,message.sent',
    '<%= config.bin %> <%= command.id %> --forward-to http://localhost:3000/webhook',
    '<%= config.bin %> <%= command.id %> --forward-to http://localhost:3000/webhook --events message.received',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    events: Flags.string({
      description: 'Comma-separated list of events to subscribe to (default: all). Run `linq webhooks events` to see available events.',
    }),
    'forward-to': Flags.string({
      char: 'f',
      description: 'Forward events to a local URL (e.g. http://localhost:3000/webhook)',
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
  private signingSecret: string | null = null;
  private client: ReturnType<typeof createApiClient> | null = null;
  private ws: WebSocket | null = null;
  private shuttingDown = false;
  private eventCount = 0;
  private forwardCount = 0;
  private startedAt = Date.now();

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksListen);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    this.client = createApiClient(token);

    const forwardTo = flags['forward-to'];

    // Validate events if specified
    let subscribedEvents: WebhookEventType[];
    if (flags.events) {
      const eventList = flags.events.split(',').map((e) => e.trim());
      const invalid = eventList.filter((e) => !WEBHOOK_EVENTS.includes(e as WebhookEventType));
      if (invalid.length > 0) {
        this.log(chalk.red(`\n  Unknown event${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}\n`));
        this.log(`  Run ${chalk.cyan('linq webhooks events')} to see available event types.\n`);
        this.exit(1);
      }
      subscribedEvents = eventList as WebhookEventType[];
    } else {
      subscribedEvents = [...WEBHOOK_EVENTS];
    }

    const eventFilter = flags.events?.split(',').map((e) => e.trim()) || null;

    // Validate forward URL if specified
    if (forwardTo) {
      try {
        new URL(forwardTo);
      } catch {
        this.log(chalk.red(`\n  Invalid forward URL: ${forwardTo}\n`));
        this.log(`  Example: ${chalk.cyan('--forward-to http://localhost:3000/webhook')}\n`);
        this.exit(1);
      }
    }

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
      this.log(`Listening for events... ${chalk.dim('(Ctrl+C to stop)')}`);
      this.log(`Webhook ID: ${chalk.dim(this.webhookId || '–')}`);
      if (forwardTo) {
        this.log(`Forwarding to: ${chalk.cyan(forwardTo)}`);
      }
      this.log('');

      // Listen for events with auto-reconnect
      await this.listenLoop(wsUrl, token, relayUrl, subscribedEvents, eventFilter, flags.json, forwardTo);
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
    jsonOutput: boolean,
    forwardTo?: string,
  ): Promise<void> {
    let reconnectDelay = 1000;

    this.setupMessageHandler(eventFilter, jsonOutput, forwardTo);

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

        this.setupMessageHandler(eventFilter, jsonOutput, forwardTo);
      } catch (error) {
        if (this.shuttingDown) return;
        this.log(`Reconnect failed: ${(error as Error).message}`);
      }
    }
  }

  private setupMessageHandler(
    eventFilter: string[] | null,
    jsonOutput: boolean,
    forwardTo?: string,
  ): void {
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

        this.eventCount++;

        // Forward to local server if configured
        if (forwardTo) {
          this.forwardEvent(forwardTo, raw, data, jsonOutput);
        } else if (jsonOutput) {
          this.log(JSON.stringify(data, null, 2));
        } else {
          this.log(formatLogLine(data));
        }
      } catch {
        this.logToStderr(`Warning: received unparseable message: ${String(event.data).slice(0, 200)}`);
      }
    });
  }

  private async forwardEvent(
    forwardTo: string,
    rawPayload: string,
    data: WebhookEvent,
    jsonOutput: boolean,
  ): Promise<void> {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const eventType = data.event_type || 'unknown';

    // Compute signature if we have a signing secret
    let signature = '';
    if (this.signingSecret) {
      const signedData = `${timestamp}.${rawPayload}`;
      signature = crypto
        .createHmac('sha256', this.signingSecret)
        .update(signedData)
        .digest('hex');
    }

    const start = Date.now();
    try {
      const res = await fetch(forwardTo, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': eventType,
          'X-Webhook-Timestamp': timestamp,
          ...(signature && { 'X-Webhook-Signature': signature }),
          ...(this.webhookId && { 'X-Webhook-Subscription-ID': this.webhookId }),
        },
        body: rawPayload,
      });

      const duration = Date.now() - start;
      this.forwardCount++;

      const statusColor = res.ok ? chalk.green : chalk.red;
      const statusText = `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`;

      if (jsonOutput) {
        this.log(JSON.stringify({ ...data, _forward: { status: res.status, duration_ms: duration } }, null, 2));
      } else {
        const time = chalk.dim(new Date().toLocaleTimeString());
        this.log(
          `${time}  ${chalk.dim(eventType.padEnd(30))} ${chalk.dim('→')} ${chalk.dim(forwardTo)}  [${statusColor(statusText)}]  ${chalk.dim(`(${duration}ms`)})`
        );
      }
    } catch (error) {
      const duration = Date.now() - start;
      const errMsg = error instanceof Error ? error.message : String(error);

      if (jsonOutput) {
        this.log(JSON.stringify({ ...data, _forward: { error: errMsg, duration_ms: duration } }, null, 2));
      } else {
        const time = chalk.dim(new Date().toLocaleTimeString());
        this.log(
          `${time}  ${chalk.dim(eventType.padEnd(30))} ${chalk.dim('→')} ${chalk.dim(forwardTo)}  [${chalk.red('FAILED')}]  ${chalk.dim(errMsg)}`
        );
      }
    }
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
      this.signingSecret = (data as any).signing_secret || null;
      this.log(`Webhook created: ${data.id}`);
      this.log(`Events: ${data.subscribed_events.join(', ')}`);
      if (this.signingSecret) {
        this.log(`Signing secret: ${chalk.dim(this.signingSecret)} ${chalk.dim('(this session only)')}`);
      }
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

    // Show session stats
    const uptime = Math.round((Date.now() - this.startedAt) / 1000);
    const mins = Math.floor(uptime / 60);
    const secs = uptime % 60;
    const stats = [`${this.eventCount} events received`];
    if (this.forwardCount > 0) {
      stats.push(`${this.forwardCount} forwarded`);
    }
    this.log(`\n${chalk.dim(`Session: ${stats.join(', ')} in ${mins}m ${secs}s`)}`);

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
