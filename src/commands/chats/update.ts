import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatChatDetail } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

export default class ChatsUpdate extends Command {
  static override description = 'Update a chat (display name, group icon)';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID --name "Team Discussion"',
    '<%= config.bin %> <%= command.id %> CHAT_ID --icon https://example.com/icon.png',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    name: Flags.string({
      description: 'New display name for the chat',
    }),
    icon: Flags.string({
      description: 'URL for group chat icon',
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
    const { args, flags } = await this.parse(ChatsUpdate);

    if (!flags.name && !flags.icon) {
      this.error('At least one of --name or --icon must be specified');
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const body: Record<string, string> = {};
    if (flags.name) body.display_name = flags.name;
    if (flags.icon) body.group_chat_icon = flags.icon;

    const { data, error } = await client.PUT('/v3/chats/{chatId}', {
      params: { path: { chatId: args.chatId } },
      body,
    });

    if (error) {
      this.error(`Failed to update chat: ${parseApiError(error)}`);
    }

    if (!data) {
      this.error('Failed to update chat: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      this.log(formatChatDetail(data));
    }
  }
}
