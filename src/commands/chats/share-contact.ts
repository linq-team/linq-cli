import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { parseApiError } from '../../lib/errors.js';

export default class ChatsShareContact extends Command {
  static override description = 'Share your contact card with a chat';

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
    const { args, flags } = await this.parse(ChatsShareContact);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      await client.chats.shareContactWithChat(args.chatId);
      this.log('Contact card shared successfully.');
    } catch (err) {
      this.error(`Failed to share contact: ${parseApiError(err)}`);
    }
  }
}
