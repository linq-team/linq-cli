import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsList extends Command {
  static override description = 'List all chats for a phone number';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --from +12025551234',
    '<%= config.bin %> <%= command.id %> --limit 50',
    '<%= config.bin %> <%= command.id %> --profile work',
  ];

  static override flags = {
    from: Flags.string({
      description: 'Phone number to list chats for (E.164 format). Uses config fromPhone if not specified.',
    }),
    limit: Flags.integer({
      description: 'Maximum number of chats to return (default: 20, max: 100)',
      default: 20,
    }),
    cursor: Flags.string({
      description: 'Pagination cursor from previous response',
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
    const { flags } = await this.parse(ChatsList);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const fromPhone = requireFromPhone(flags.from, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/chats', {
      params: {
        query: {
          from: fromPhone,
          limit: flags.limit,
          cursor: flags.cursor,
        },
      },
    });

    if (error) {
      this.error(`Failed to list chats: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list chats: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
