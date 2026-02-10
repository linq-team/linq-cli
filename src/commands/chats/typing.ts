import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsTyping extends Command {
  static override description = 'Start or stop typing indicator in a chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID',
    '<%= config.bin %> <%= command.id %> CHAT_ID --stop',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    stop: Flags.boolean({
      description: 'Stop typing indicator (default is to start)',
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
    const { args, flags } = await this.parse(ChatsTyping);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    if (flags.stop) {
      const { error } = await client.DELETE('/v3/chats/{chatId}/typing', {
        params: { path: { chatId: args.chatId } },
      });

      if (error) {
        this.error(`Failed to stop typing: ${JSON.stringify(error)}`);
      }

      this.log('Typing indicator stopped.');
    } else {
      const { error } = await client.POST('/v3/chats/{chatId}/typing', {
        params: { path: { chatId: args.chatId } },
      });

      if (error) {
        this.error(`Failed to start typing: ${JSON.stringify(error)}`);
      }

      this.log('Typing indicator started.');
    }
  }
}
