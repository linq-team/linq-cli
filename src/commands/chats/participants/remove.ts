import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../../lib/base-command.js';
import { loadConfig, requireToken } from '../../../lib/config.js';
import { createApiClient } from '../../../lib/api-client.js';

export default class ParticipantsRemove extends BaseCommand {
  static override description = 'Remove a participant from a group chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID --handle +19876543210',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    handle: Flags.string({
      description: 'Phone number or email of participant to remove',
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
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ParticipantsRemove);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.chats.participants.remove(args.chatId, {
        handle: flags.handle,
      });

      this.log(JSON.stringify(data, null, 2));
    } catch (e) {
      this.error(`Failed to remove participant: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
