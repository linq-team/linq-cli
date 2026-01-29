import { Command, Flags } from '@oclif/core';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import type { components } from '../gen/api-types.js';

type MessageReceivedWebhook = components['schemas']['MessageReceivedWebhook'];
type MessageSentWebhook = components['schemas']['MessageSentWebhook'];
type MessageDeliveredWebhook = components['schemas']['MessageDeliveredWebhook'];
type MessageReadWebhook = components['schemas']['MessageReadWebhook'];
type MessageFailedWebhook = components['schemas']['MessageFailedWebhook'];
type MessagePayload = components['schemas']['MessagePayload'];

interface WebhookEvent {
  event_type?: string;
  created_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export default class Listen extends Command {
  static override description = 'Listen for incoming messages';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --port 4567',
    '<%= config.bin %> <%= command.id %> --events message.received,message.delivered',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    port: Flags.integer({
      char: 'p',
      description: 'Local port to listen on',
      default: 4040,
    }),
    json: Flags.boolean({
      description: 'Output events as JSON lines',
      default: false,
    }),
    events: Flags.string({
      description: 'Event types to filter (comma-separated)',
    }),
  };

  private server: ReturnType<typeof createServer> | null = null;

  async run(): Promise<void> {
    const { flags } = await this.parse(Listen);

    const eventFilter = flags.events?.split(',').map((e) => e.trim()) || null;

    await new Promise<void>((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res, flags.json, eventFilter);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(flags.port, () => {
        this.log(`Listening for events on :${flags.port}`);
        this.log('Press Ctrl+C to stop\n');
      });

      // Handle graceful shutdown
      const shutdown = () => {
        this.log('\nShutting down...');
        this.server?.close(() => {
          resolve();
        });
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
  }

  private handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
    jsonOutput: boolean,
    eventFilter: string[] | null
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
          this.log(body);
        } else {
          this.printEvent(event);
        }

        res.writeHead(200);
        res.end();
      } catch {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  }

  private printEvent(event: WebhookEvent): void {
    const timestamp = event.created_at || new Date().toISOString();

    switch (event.event_type) {
      case 'message.received': {
        const wh = event as MessageReceivedWebhook;
        const from = wh.data?.from || 'unknown';
        const msg = this.extractText(wh.data?.message);
        this.log(`[${timestamp}] << ${from}: ${msg}`);
        break;
      }

      case 'message.sent': {
        const wh = event as MessageSentWebhook;
        const msg = this.extractText(wh.data?.message);
        this.log(`[${timestamp}] >> sent: ${msg}`);
        break;
      }

      case 'message.delivered': {
        const wh = event as MessageDeliveredWebhook;
        const msgId = wh.data?.message_id || 'unknown';
        this.log(`[${timestamp}] -- delivered (message: ${msgId})`);
        break;
      }

      case 'message.read': {
        const wh = event as MessageReadWebhook;
        const msgId = wh.data?.message_id || 'unknown';
        this.log(`[${timestamp}] -- read (message: ${msgId})`);
        break;
      }

      case 'message.failed': {
        const wh = event as MessageFailedWebhook;
        const msgId = wh.data?.message_id || 'unknown';
        const code = wh.data?.code || 'unknown';
        this.log(`[${timestamp}] !! failed (message: ${msgId}, code: ${code})`);
        break;
      }

      default:
        this.log(`[${timestamp}] ${event.event_type || 'unknown'}`);
    }
  }

  private extractText(message: MessagePayload | undefined): string {
    if (!message?.parts) {
      return '';
    }

    for (const part of message.parts) {
      if ('value' in part && typeof part.value === 'string') {
        return part.value;
      }
    }

    return '(media)';
  }
}
