import { Args, Flags } from '@oclif/core';
import { bail } from '../../lib/errors.js';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessagesList } from '../../lib/format.js';

export default class MessagesList extends BaseCommand {
  static override description = 'List messages in a chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID',
    '<%= config.bin %> <%= command.id %> CHAT_ID --limit 50',
    '<%= config.bin %> <%= command.id %> --chat CHAT_ID',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID to list messages for (UUID)',
    }),
  };

  static override flags = {
    chat: Flags.string({
      aliases: ['chat-id'],
      description: 'Chat ID to list messages for (alternative to the CHAT_ID argument)',
    }),
    limit: Flags.integer({
      description: 'Maximum number of messages to return (default: 50, max: 100)',
      default: 50,
    }),
    cursor: Flags.string({
      description: 'Pagination cursor from previous response',
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
    const { args, flags } = await this.parse(MessagesList);
    if (args.chatId && flags.chat && args.chatId !== flags.chat) {
      this.error(`Conflicting chat IDs: ${args.chatId} and --chat ${flags.chat}`);
    }
    const chatId = args.chatId ?? flags.chat;
    if (!chatId) {
      this.error('Missing chat ID. Usage: linq messages list CHAT_ID');
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      // Fetch the chat alongside the messages so we can render
      // "you → counterparty" / "counterparty → you" in the list.
      const [data, chat] = await Promise.all([
        client.chats.messages.list(chatId, {
          limit: flags.limit,
          cursor: flags.cursor,
        }),
        client.chats.retrieve(chatId).catch(() => undefined),
      ]);

      if (flags.json) {
        this.log(JSON.stringify({ messages: data.messages, next_cursor: data.next_cursor }, null, 2));
      } else {
        this.log(formatMessagesList(data, chat));
      }
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
