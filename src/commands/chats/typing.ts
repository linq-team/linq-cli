import { Args, Flags } from '@oclif/core';
import { bail } from '../../lib/errors.js';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsTyping extends BaseCommand {
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
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ChatsTyping);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const action = flags.stop ? 'stop' : 'start';
      if (flags.stop) {
        await client.chats.typing.stop(args.chatId);
      } else {
        await client.chats.typing.start(args.chatId);
      }
      if (flags.json) {
        this.log(JSON.stringify({ success: true, chatId: args.chatId, action: `typing.${action}` }, null, 2));
        return;
      }
      this.log(flags.stop ? 'Typing indicator stopped.' : 'Typing indicator started.');
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
