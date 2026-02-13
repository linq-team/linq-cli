import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatChatDetail } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

export default class ChatsGet extends BaseCommand {
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
    const { args, flags } = await this.parse(ChatsGet);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      const data = await client.chats.getChat(args.chatId);

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatChatDetail(data));
      }
    } catch (err) {
      this.error(`Failed to get chat: ${parseApiError(err)}`);
    }
  }
}
