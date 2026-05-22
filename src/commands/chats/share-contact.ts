import { Args, Flags } from '@oclif/core';
import { bail } from '../../lib/errors.js';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsShareContact extends BaseCommand {
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
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ChatsShareContact);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      await client.chats.shareContactCard(args.chatId);
      if (flags.json) {
        this.log(JSON.stringify({ success: true, chatId: args.chatId, action: 'share_contact' }, null, 2));
        return;
      }
      this.log('Contact card shared successfully.');
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
