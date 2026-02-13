import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatChatsList } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

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
    const { flags } = await this.parse(ChatsList);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const fromPhone = requireFromPhone(flags.from, config);
    const client = createLinqClient(token);

    try {
      const data = await client.chats.listChats(fromPhone, flags.limit, flags.cursor);

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatChatsList(data));
      }
    } catch (err) {
      this.error(`Failed to list chats: ${parseApiError(err)}`);
    }
  }
}
