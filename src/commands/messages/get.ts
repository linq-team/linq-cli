import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class MessagesGet extends Command {
  static override description = 'Get a message by ID';

  static override examples = ['<%= config.bin %> <%= command.id %> MESSAGE_ID'];

  static override args = {
    messageId: Args.string({
      description: 'Message ID (UUID)',
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
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MessagesGet);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/messages/{messageId}', {
      params: {
        path: {
          messageId: args.messageId,
        },
      },
    });

    if (error) {
      this.error(`Failed to get message: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get message: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
