import { Args, Flags } from '@oclif/core';
import { bail } from '../../lib/errors.js';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsVoicememo extends BaseCommand {
  static override description = 'Send a voice memo to a chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID --url https://example.com/memo.m4a',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    url: Flags.string({
      description: 'URL of the voice memo audio file',
      required: true,
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
    const { args, flags } = await this.parse(ChatsVoicememo);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.chats.sendVoicememo(args.chatId, {
        voice_memo_url: flags.url,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
        return;
      }

      const messageId = (data as { message?: { id?: string } })?.message?.id;
      this.log(`Voice memo sent to chat ${args.chatId}${messageId ? ` (message ${messageId})` : ''}.`);
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
