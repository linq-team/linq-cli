import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { parseApiError } from '../../lib/errors.js';

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
    from: Flags.string({
      description: 'Sender phone number (E.164 format). Uses config fromPhone if not specified.',
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
    const { args, flags } = await this.parse(ChatsVoicememo);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const fromPhone = requireFromPhone(flags.from, config);
    const client = createLinqClient(token);

    try {
      const data = await client.messages.sendVoiceMemoToChat(args.chatId, {
        from: fromPhone,
        voiceMemoUrl: flags.url,
      });

      this.log(JSON.stringify(data, null, 2));
    } catch (err) {
      this.error(`Failed to send voice memo: ${parseApiError(err)}`);
    }
  }
}
