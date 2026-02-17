import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessagesList } from '../../lib/format.js';

export default class MessagesList extends BaseCommand {
  static override description = 'List messages in a chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID',
    '<%= config.bin %> <%= command.id %> CHAT_ID --limit 50',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID to list messages for (UUID)',
      required: true,
    }),
  };

  static override flags = {
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

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.chats.messages.list(args.chatId, {
        limit: flags.limit,
        cursor: flags.cursor,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatMessagesList(data));
      }
    } catch (e) {
      this.error(`Failed to list messages: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
