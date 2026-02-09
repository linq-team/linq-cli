import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
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

export default class MessagesSend extends Command {
  static override description = 'Send a message to an existing chat';

  static override examples = [
    '<%= config.bin %> <%= command.id %> CHAT_ID --message "Hello"',
    '<%= config.bin %> <%= command.id %> CHAT_ID --from +12025551234 --message "Hello"',
    '<%= config.bin %> <%= command.id %> CHAT_ID --message "Wow!" --effect fireworks',
    '<%= config.bin %> <%= command.id %> CHAT_ID --message "Reply" --reply-to MSG_ID',
    '<%= config.bin %> <%= command.id %> CHAT_ID --message "Hello" --profile work',
  ];

  static override args = {
    chatId: Args.string({
      description: 'Chat ID to send message to (UUID)',
      required: true,
    }),
  };

  static override flags = {
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
    'reply-to': Flags.string({
      description: 'Message ID to reply to (creates a thread)',
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
    const { args, flags } = await this.parse(MessagesSend);

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

    const { data, error } = await client.POST('/v3/chats/{chatId}/messages', {
      params: {
        path: {
          chatId: args.chatId,
        },
      },
      body: {
        from: fromPhone,
        message: {
          parts: [textPart],
          effect,
          reply_to: flags['reply-to']
            ? { message_id: flags['reply-to'], part_index: 0 }
            : undefined,
        },
      },
    });

    if (error) {
      this.error(`Failed to send message: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to send message: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
