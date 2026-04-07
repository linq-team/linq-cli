import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatDeleted } from '../../lib/format.js';

export default class MessagesDelete extends BaseCommand {
  static override description = 'Delete a message from API records';

  static override examples = [
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --chat CHAT_ID',
  ];

  static override args = {
    messageId: Args.string({
      description: 'Message ID to delete (UUID)',
      required: true,
    }),
  };

  static override flags = {
    chat: Flags.string({
      description: 'Chat ID the message belongs to (UUID)',
      required: true,
    }),
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
    const { args, flags } = await this.parse(MessagesDelete);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      await client.messages.delete(args.messageId, { chat_id: flags.chat });

      if (flags.json) {
        this.log(JSON.stringify({ deleted: true, messageId: args.messageId }));
      } else {
        this.log(formatDeleted('Message', args.messageId));
      }
    } catch (e) {
      this.error(`Failed to delete message: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
