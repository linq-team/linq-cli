import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { parseApiError } from '../../lib/errors.js';

export default class ChatsRead extends Command {
  static override description = 'Mark all messages in a chat as read';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
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
    const { args, flags } = await this.parse(ChatsRead);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      await client.chats.markChatAsRead(args.chatId);
      this.log(`Chat ${args.chatId} marked as read.`);
    } catch (err) {
      this.error(`Failed to mark chat as read: ${parseApiError(err)}`);
    }
  }
}
