import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import type { components } from '../../gen/api-types.js';

type MessagePart = components['schemas']['MessagePart'];
type MessageEffect = components['schemas']['MessageEffect'];

const SCREEN_EFFECTS = [
  'confetti',
  'fireworks',
  'lasers',
  'sparkles',
  'celebration',
  'hearts',
  'love',
  'balloons',
  'happy_birthday',
  'echo',
  'spotlight',
];

const BUBBLE_EFFECTS = ['slam', 'loud', 'gentle', 'invisible'];
const ALL_EFFECTS = [...SCREEN_EFFECTS, ...BUBBLE_EFFECTS];

export default class ChatsCreate extends Command {
  static override description = 'Create a new chat and send an initial message';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --to +19876543210 --from +12025551234 --message "Hello"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --from +12025551234 --message "Party!" --effect confetti',
    '<%= config.bin %> <%= command.id %> --to +1111111111 --to +2222222222 --from +12025551234 --message "Group chat"',
  ];

  static override flags = {
    to: Flags.string({
      description:
        'Recipient phone number or email (E.164 format for phones). Can be specified multiple times for group chats.',
      required: true,
      multiple: true,
    }),
    from: Flags.string({
      description: 'Sender phone number (E.164 format)',
      required: true,
    }),
    message: Flags.string({
      char: 'm',
      description: 'Message text to send',
      required: true,
    }),
    effect: Flags.string({
      description: `iMessage effect (${ALL_EFFECTS.join(', ')})`,
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
    const { flags } = await this.parse(ChatsCreate);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    // Build message parts
    const textPart: MessagePart = {
      type: 'text',
      value: flags.message,
    };

    // Build effect if specified
    let effect: MessageEffect | undefined;
    if (flags.effect) {
      if (SCREEN_EFFECTS.includes(flags.effect)) {
        effect = { type: 'screen', name: flags.effect };
      } else if (BUBBLE_EFFECTS.includes(flags.effect)) {
        effect = { type: 'bubble', name: flags.effect };
      } else {
        this.error(`Invalid effect: ${flags.effect}. Valid effects: ${ALL_EFFECTS.join(', ')}`);
      }
    }

    const { data, error } = await client.POST('/v3/chats', {
      body: {
        from: flags.from,
        to: flags.to,
        message: {
          parts: [textPart],
          effect,
        },
      },
    });

    if (error) {
      this.error(`Failed to create chat: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to create chat: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      const recipients = flags.to.join(', ');
      this.log(
        `Chat created with ${recipients} (chat: ${data.chat.id}, message: ${data.chat.message.id})`
      );
    }
  }
}
