import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

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
    const client = createApiClient(token);

    const { error } = await client.POST('/v3/chats/{chatId}/read', {
      params: { path: { chatId: args.chatId } },
    });

    if (error) {
      this.error(`Failed to mark chat as read: ${JSON.stringify(error)}`);
    }

    this.log(`Chat ${args.chatId} marked as read.`);
  }
}
