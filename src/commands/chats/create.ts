import { Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatChatCreated } from '../../lib/format.js';
import type Linq from '@linqapp/sdk';

type MessagePart = Linq.Chats.ChatCreateParams['message']['parts'][number];
type MessageEffect = Linq.Chats.ChatCreateParams['message']['effect'];

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

export default class ChatsCreate extends BaseCommand {
  static override description = 'Create a new chat and send an initial message';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --to +19876543210 --message "Hello"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --from +12025551234 --message "Hello"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --message "Party!" --effect confetti',
    '<%= config.bin %> <%= command.id %> --to +1111111111 --to +2222222222 --message "Group chat"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --message "Hello" --profile work',
  ];

  static override flags = {
    to: Flags.string({
      description:
        'Recipient phone number or email (E.164 format for phones). Can be specified multiple times for group chats.',
      required: true,
      multiple: true,
    }),
    from: Flags.string({
      description: 'Sender phone number (E.164 format). Uses config fromPhone if not specified.',
    }),
    message: Flags.string({
      char: 'm',
      description: 'Message text to send',
      required: true,
    }),
    effect: Flags.string({
      description: `iMessage effect (${ALL_EFFECTS.join(', ')})`,
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
    const { flags } = await this.parse(ChatsCreate);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const fromPhone = requireFromPhone(flags.from, config);
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

    try {
      const data = await client.chats.create({
        from: fromPhone,
        to: flags.to,
        message: {
          parts: [textPart],
          effect,
        },
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatChatCreated(data));
      }
    } catch (e) {
      this.error(`Failed to create chat: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
