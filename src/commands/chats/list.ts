import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class ChatsList extends Command {
  static override description = 'List all chats for a phone number';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --from +12025551234',
    '<%= config.bin %> <%= command.id %> --from +12025551234 --limit 50',
    '<%= config.bin %> <%= command.id %> --from +12025551234 --json',
  ];

  static override flags = {
    from: Flags.string({
      description: 'Phone number to list chats for (E.164 format)',
      required: true,
    }),
    limit: Flags.integer({
      description: 'Maximum number of chats to return (default: 20, max: 100)',
      default: 20,
    }),
    cursor: Flags.string({
      description: 'Pagination cursor from previous response',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
    json: Flags.boolean({
      description: 'Output response as JSON',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ChatsList);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/chats', {
      params: {
        query: {
          from: flags.from,
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

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    const chats = data.chats;

    if (chats.length === 0) {
      this.log('No chats found.');
      return;
    }

    // Print table header
    this.log(`${'CHAT ID'.padEnd(38)} ${'HANDLES'.padEnd(40)} ${'SERVICE'.padEnd(10)}`);
    this.log(`${'-------'.padEnd(38)} ${'-------'.padEnd(40)} ${'-------'.padEnd(10)}`);

    for (const chat of chats) {
      const handles = chat.handles
        .map((h) => h.handle)
        .slice(0, 3)
        .join(', ');
      const handleDisplay =
        chat.handles.length > 3 ? `${handles}... (+${chat.handles.length - 3})` : handles;
      const service = chat.service || 'N/A';

      this.log(`${chat.id.padEnd(38)} ${handleDisplay.padEnd(40)} ${service.padEnd(10)}`);
    }

    if (data.next_cursor) {
      this.log(`\nMore results available. Use --cursor ${data.next_cursor} to see more.`);
    }
  }
}
