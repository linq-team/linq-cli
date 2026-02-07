import { Command, Flags } from '@oclif/core';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import ngrok from '@ngrok/ngrok';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatLogLine } from '../../lib/webhook-format.js';
import type { components } from '../../gen/api-types.js';

type WebhookEventType = components['schemas']['WebhookEventType'];

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
];

export default class WebhooksListen extends Command {
  static override description =
    'Start a local server with ngrok tunnel to receive webhook events';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --events message.received,message.sent',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    port: Flags.integer({
      char: 'p',
      description: 'Local port to listen on',
      default: 4040,
    }),
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
    'ngrok-authtoken': Flags.string({
      description: 'ngrok auth token (overrides stored token)',
    }),
    json: Flags.boolean({
      description: 'Output raw JSON instead of structured log format',
      default: false,
    }),
  };

  private server: ReturnType<typeof createServer> | null = null;
  private listener: ngrok.Listener | null = null;
  private webhookId: string | null = null;
  private client: ReturnType<typeof createApiClient> | null = null;

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksListen);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    this.client = createApiClient(token);

    const ngrokAuthtoken = flags['ngrok-authtoken'] || config.ngrokAuthtoken;

    if (!ngrokAuthtoken) {
      this.error(
        "No ngrok auth token found. Get one at https://dashboard.ngrok.com/get-started/your-authtoken\n" +
          "Then run: linq config set ngrokAuthtoken YOUR_TOKEN\n" +
          'Or set NGROK_AUTHTOKEN environment variable'
      );
    }

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

    // Start local server
    await new Promise<void>((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res, eventFilter, flags.json);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(flags.port, async () => {
        this.log(`Local server started on port ${flags.port}`);

        try {
          // Start ngrok tunnel
          const listenerBuilder = await ngrok.forward({
            addr: flags.port,
            authtoken: ngrokAuthtoken,
          });

          this.listener = listenerBuilder;
          const url = listenerBuilder.url();

          if (!url) {
            throw new Error('Failed to get ngrok tunnel URL');
          }

          const webhookUrl = `${url}/webhook`;
          this.log(`ngrok tunnel: ${url}`);
          this.log('');

          await this.createWebhook(webhookUrl, subscribedEvents);

          this.log('');
          this.log('Listening for events... (Ctrl+C to stop)');
          this.log('');
        } catch (err) {
          await this.cleanup();
          reject(err);
        }
      });

      // Handle graceful shutdown
      const shutdown = async () => {
        this.log('\nShutting down...');
        await this.cleanup();
        resolve();
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
  }

  private async createWebhook(
    webhookUrl: string,
    subscribedEvents: WebhookEventType[]
  ): Promise<void> {
    const { data, error } = await this.client!.POST(
      '/v3/webhook-subscriptions',
      {
        body: {
          target_url: webhookUrl,
          subscribed_events: subscribedEvents,
        },
      }
    );

    if (error) {
      this.error(`Failed to create webhook: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to create webhook: no response data');
    }

    this.webhookId = data.id;
    this.log(`Webhook created: ${data.id}`);
    this.log(`URL: ${data.target_url}`);
    this.log(`Events: ${data.subscribed_events.join(', ')}`);
  }

  private async cleanup(): Promise<void> {
    // Delete webhook subscription
    if (this.webhookId && this.client) {
      try {
        await this.client.DELETE('/v3/webhook-subscriptions/{subscriptionId}', {
          params: { path: { subscriptionId: this.webhookId } },
        });
        this.log(`Webhook ${this.webhookId} deleted`);
      } catch {
        // Ignore cleanup errors
      }
    }

    // Close ngrok listener
    if (this.listener) {
      try {
        await this.listener.close();
      } catch {
        // Ignore
      }
    }

    // Close server
    this.server?.close();
  }

  private handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
    eventFilter: string[] | null,
    jsonOutput: boolean
  ): void {
    if (req.method !== 'POST' || req.url !== '/webhook') {
      res.writeHead(req.url === '/webhook' ? 405 : 404);
      res.end();
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const event = JSON.parse(body) as WebhookEvent;

        // Apply event filter if specified
        if (
          eventFilter &&
          event.event_type &&
          !eventFilter.includes(event.event_type)
        ) {
          res.writeHead(200);
          res.end();
          return;
        }

        if (jsonOutput) {
          // Raw JSON output
          this.log(JSON.stringify(event, null, 2));
        } else {
          // Structured log format
          this.log(formatLogLine(event));
        }

        res.writeHead(200);
        res.end();
      } catch {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  }
}
