import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class MessagesGet extends Command {
  static override description = 'Get a message by ID';

  static override examples = [
    '<%= config.bin %> <%= command.id %> MESSAGE_ID',
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --json',
  ];

  static override args = {
    messageId: Args.string({
      description: 'Message ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
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
    const { args, flags } = await this.parse(MessagesGet);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/messages/{messageId}', {
      params: {
        path: {
          messageId: args.messageId,
        },
      },
    });

    if (error) {
      this.error(`Failed to get message: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get message: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    // data IS the message directly
    this.log(`Message ID: ${data.id}`);
    this.log(`Chat ID: ${data.chat_id}`);
    this.log(`From: ${data.from_handle?.handle || data.from || 'Unknown'}`);
    this.log(`Service: ${data.service || 'N/A'}`);
    this.log(`Delivered: ${data.is_delivered}`);
    this.log(`Read: ${data.is_read}`);
    if (data.sent_at) {
      this.log(`Sent At: ${new Date(data.sent_at).toLocaleString()}`);
    }
    if (data.delivered_at) {
      this.log(`Delivered At: ${new Date(data.delivered_at).toLocaleString()}`);
    }
    if (data.read_at) {
      this.log(`Read At: ${new Date(data.read_at).toLocaleString()}`);
    }

    if (data.parts) {
      this.log(`\nContent:`);
      for (const part of data.parts) {
        if (part.type === 'text' && 'value' in part) {
          this.log(`  Text: ${part.value}`);
        } else if (part.type === 'media' && 'mime_type' in part) {
          this.log(`  Media: ${part.mime_type} (${part.url})`);
        }
      }
    }

    if (data.effect) {
      this.log(`\nEffect: ${data.effect.type} - ${data.effect.name}`);
    }
  }
}
