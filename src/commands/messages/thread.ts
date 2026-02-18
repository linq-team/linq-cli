import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessagesList } from '../../lib/format.js';

export default class MessagesThread extends BaseCommand {
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
    const { args, flags } = await this.parse(MessagesThread);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    try {
      const data = await client.messages.retrieveThread(args.messageId, {
        limit: flags.limit,
        cursor: flags.cursor,
        order: flags.order as 'asc' | 'desc' | undefined,
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatMessagesList(data));
      }
    } catch (e) {
      this.error(`Failed to get thread: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
