import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsGet extends Command {
  static override description = 'Get a chat by ID';

  static override examples = [
    '<%= config.bin %> <%= command.id %> 550e8400-e29b-41d4-a716-446655440000',
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
    const { args, flags } = await this.parse(ChatsGet);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/chats/{chatId}', {
      params: {
        path: {
          chatId: args.chatId,
        },
      },
    });

    if (error) {
      this.error(`Failed to get chat: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get chat: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
