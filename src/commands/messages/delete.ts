import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatDeleted } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

export default class MessagesDelete extends Command {
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
    const client = createLinqClient(token);

    try {
      await client.messages.deleteMessage(args.messageId, { chatId: flags.chat });

      if (flags.json) {
        this.log(JSON.stringify({ deleted: true, messageId: args.messageId }));
      } else {
        this.log(formatDeleted('Message', args.messageId));
      }
    } catch (err) {
      this.error(`Failed to delete message: ${parseApiError(err)}`);
    }
  }
}
