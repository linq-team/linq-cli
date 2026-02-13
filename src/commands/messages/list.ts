import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatMessagesList } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

export default class MessagesList extends Command {
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
      description: 'Maximum number of messages to return (default: 20, max: 100)',
      default: 20,
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
    const client = createLinqClient(token);

    try {
      const data = await client.messages.getMessages(args.chatId, flags.cursor, flags.limit);

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatMessagesList(data));
      }
    } catch (err) {
      this.error(`Failed to list messages: ${parseApiError(err)}`);
    }
  }
}
