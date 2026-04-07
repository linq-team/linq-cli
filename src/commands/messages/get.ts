import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessageDetail } from '../../lib/format.js';

export default class MessagesGet extends BaseCommand {
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

    try {
      const data = await client.messages.retrieve(args.messageId);

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatMessageDetail(data));
      }
    } catch (e) {
      this.error(`Failed to get message: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
