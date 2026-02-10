import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessageDetail } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

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
      this.error(`Failed to get message: ${parseApiError(error)}`);
    }

    if (!data) {
      this.error('Failed to get message: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      this.log(formatMessageDetail(data));
    }
  }
}
