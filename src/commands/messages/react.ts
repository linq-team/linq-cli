import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import type { components } from '../../gen/api-types.js';

type ReactionType = components['schemas']['ReactionType'];

const REACTION_TYPES: ReactionType[] = [
  'love',
  'like',
  'dislike',
  'laugh',
  'emphasize',
  'question',
  'custom',
];

export default class MessagesReact extends Command {
  static override description = 'Add or remove a reaction to a message';

  static override examples = [
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --type love',
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --type custom --emoji "🎉"',
    '<%= config.bin %> <%= command.id %> MESSAGE_ID --type love --operation remove',
  ];

  static override args = {
    messageId: Args.string({
      description: 'Message ID to react to (UUID)',
      required: true,
    }),
  };

  static override flags = {
    type: Flags.string({
      description: `Reaction type: ${REACTION_TYPES.join(', ')}`,
      required: true,
    }),
    emoji: Flags.string({
      description: 'Custom emoji (required when type is "custom")',
    }),
    operation: Flags.string({
      description: 'Operation to perform',
      options: ['add', 'remove'],
      default: 'add',
    }),
    'part-index': Flags.integer({
      description: 'Index of the message part to react to (default: 0)',
      default: 0,
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
    const { args, flags } = await this.parse(MessagesReact);

    // Validate reaction type
    if (!REACTION_TYPES.includes(flags.type as ReactionType)) {
      this.error(
        `Invalid reaction type: ${flags.type}. Valid types: ${REACTION_TYPES.join(', ')}`
      );
    }

    // Validate custom emoji is provided when type is custom
    if (flags.type === 'custom' && !flags.emoji) {
      this.error('--emoji is required when using --type custom');
    }

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.POST('/v3/messages/{messageId}/reactions', {
      params: {
        path: {
          messageId: args.messageId,
        },
      },
      body: {
        operation: flags.operation as 'add' | 'remove',
        type: flags.type as ReactionType,
        custom_emoji: flags.type === 'custom' ? flags.emoji : undefined,
        part_index: flags['part-index'],
      },
    });

    if (error) {
      this.error(`Failed to ${flags.operation} reaction: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error(`Failed to ${flags.operation} reaction: no response data`);
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
