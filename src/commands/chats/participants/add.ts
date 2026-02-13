import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../../lib/base-command.js';
import { loadConfig, requireToken } from '../../../lib/config.js';
import { createLinqClient } from '../../../lib/api-client.js';
import { parseApiError } from '../../../lib/errors.js';

export default class ParticipantsAdd extends BaseCommand {
  static override description = 'Add a participant to a group chat';

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
      description: 'Phone number or email of participant to add',
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
    const { args, flags } = await this.parse(ParticipantsAdd);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createLinqClient(token);

    try {
      const data = await client.chats.addParticipant(args.chatId, { handle: flags.handle });
      this.log(JSON.stringify(data, null, 2));
    } catch (err) {
      this.error(`Failed to add participant: ${parseApiError(err)}`);
    }
  }
}
