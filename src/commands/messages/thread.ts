import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class MessagesThread extends Command {
  static override description = 'Get all messages in a thread';

  static override examples = [
    '<%= config.bin %> <%= command.id %> MESSAGE_ID',
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --limit 10 --order desc',
  ];

  static override args = {
    messageId: Args.string({
      description: 'Any message ID in the thread (UUID)',
      required: true,
    }),
  };

  static override flags = {
    limit: Flags.integer({
      description: 'Maximum number of messages to return',
    }),
    cursor: Flags.string({
      description: 'Pagination cursor',
    }),
    order: Flags.string({
      description: 'Sort order (asc or desc)',
      options: ['asc', 'desc'],
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
    const { args, flags } = await this.parse(MessagesThread);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/messages/{messageId}/thread', {
      params: {
        path: { messageId: args.messageId },
        query: {
          limit: flags.limit,
          cursor: flags.cursor,
          order: flags.order as 'asc' | 'desc' | undefined,
        },
      },
    });

    if (error) {
      this.error(`Failed to get thread: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get thread: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
