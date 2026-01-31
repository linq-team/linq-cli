import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsGet extends Command {
  static override description = 'Get a chat by ID';

  static override examples = [
    '<%= config.bin %> <%= command.id %> 550e8400-e29b-41d4-a716-446655440000',
    '<%= config.bin %> <%= command.id %> 550e8400-e29b-41d4-a716-446655440000 --json',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
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
    const { args, flags } = await this.parse(ChatsGet);

    const config = await loadConfig();
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

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    // data IS the chat directly
    this.log(`Chat ID: ${data.id}`);
    this.log(`Display Name: ${data.display_name || 'N/A'}`);
    this.log(`Service: ${data.service || 'N/A'}`);
    this.log(`\nHandles:`);
    for (const handle of data.handles) {
      this.log(`  - ${handle.handle} (${handle.service})`);
    }
  }
}
