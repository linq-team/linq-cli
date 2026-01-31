import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class MessagesList extends Command {
  static override description = 'List messages in a chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID',
    '<%= config.bin %> <%= command.id %> CHAT_ID --limit 50',
    '<%= config.bin %> <%= command.id %> CHAT_ID --order asc',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID to list messages for (UUID)',
      required: true,
    }),
  };

  static override flags = {
    limit: Flags.integer({
      description: 'Maximum number of messages to return (default: 20, max: 100)',
      default: 20,
    }),
    cursor: Flags.string({
      description: 'Pagination cursor from previous response',
    }),
    order: Flags.string({
      description: 'Sort order (asc or desc)',
      options: ['asc', 'desc'],
      default: 'desc',
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
    const { args, flags } = await this.parse(MessagesList);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/chats/{chatId}/messages', {
      params: {
        path: {
          chatId: args.chatId,
        },
        query: {
          limit: flags.limit,
          cursor: flags.cursor,
          order: flags.order as 'asc' | 'desc',
        },
      },
    });

    if (error) {
      this.error(`Failed to list messages: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list messages: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    const messages = data.messages;

    if (messages.length === 0) {
      this.log('No messages found.');
      return;
    }

    for (const msg of messages) {
      const sender = msg.from_handle?.handle || msg.from || 'Unknown';
      const time = msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'N/A';
      // Derive status from boolean fields
      const status = msg.is_read ? 'read' : msg.is_delivered ? 'delivered' : 'sent';

      // Extract text content from parts
      let textContent = '';
      let mediaCount = 0;
      if (msg.parts) {
        for (const part of msg.parts) {
          if (part.type === 'text' && 'value' in part) {
            textContent += part.value + ' ';
          } else if (part.type === 'media') {
            mediaCount++;
          }
        }
      }
      textContent = textContent.trim() || '[no text]';
      const mediaInfo = mediaCount > 0 ? ` [${mediaCount} attachment(s)]` : '';

      this.log(`[${time}] ${sender} (${status}): ${textContent}${mediaInfo}`);
      this.log(`  ID: ${msg.id}`);
    }

    if (data.next_cursor) {
      this.log(`\nMore messages available. Use --cursor ${data.next_cursor} to see more.`);
    }
  }
}
