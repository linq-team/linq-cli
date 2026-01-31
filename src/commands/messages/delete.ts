import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

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
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MessagesDelete);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { error } = await client.DELETE('/v3/messages/{messageId}', {
      params: {
        path: {
          messageId: args.messageId,
        },
      },
      body: {
        chat_id: flags.chat,
      },
    });

    if (error) {
      this.error(`Failed to delete message: ${JSON.stringify(error)}`);
    }

    this.log(`Message ${args.messageId} deleted successfully.`);
  }
}
