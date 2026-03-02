import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireFromPhone } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatMessageSent } from '../../lib/format.js';
import {
  SCREEN_EFFECTS,
  BUBBLE_EFFECTS,
  ALL_EFFECTS,
  buildMessageBody,
} from '../../lib/constants.js';

export default class MessagesSend extends BaseCommand {
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
    const { args, flags } = await this.parse(MessagesSend);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    // fromPhone resolved but not sent — SDK's MessageSendParams doesn't include `from`
    requireFromPhone(flags.from, config);
    const client = createApiClient(token);

    // Validate effect if specified
    let effectType: string | undefined;
    let effectName: string | undefined;
    if (flags.effect) {
      if (SCREEN_EFFECTS.includes(flags.effect as typeof SCREEN_EFFECTS[number])) {
        effectType = 'screen';
        effectName = flags.effect;
      } else if (BUBBLE_EFFECTS.includes(flags.effect as typeof BUBBLE_EFFECTS[number])) {
        effectType = 'bubble';
        effectName = flags.effect;
      } else {
        this.error(`Invalid effect: ${flags.effect}. Valid effects: ${ALL_EFFECTS.join(', ')}`);
      }
    }

    try {
      const data = await client.chats.messages.send(args.chatId, {
        message: buildMessageBody(flags.message, {
          effectType,
          effectName,
          replyToMessageId: flags['reply-to'],
        }),
      });

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatMessageSent(data));
      }
    } catch (e) {
      this.error(`Failed to send message: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
