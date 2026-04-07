import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../../lib/base-command.js';
import { loadConfig, requireToken } from '../../../lib/config.js';
import { createApiClient } from '../../../lib/api-client.js';

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
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use', hidden: true,
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)', hidden: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ParticipantsAdd);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.chats.participants.add(args.chatId, {
        handle: flags.handle,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(chalk.green(`\n  \u2713 Added ${flags.handle} to chat.\n`));
      }
    } catch (e) {
      this.error(`Failed to add participant: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
