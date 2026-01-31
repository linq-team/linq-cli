import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';
import type { components } from '../gen/api-types.js';

type MessagePart = components['schemas']['MessagePart'];
type MessageEffect = components['schemas']['MessageEffect'];

export default class Send extends Command {
  static override description = 'Send a message';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --to +19876543210 --message "Hello from Linq"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --from +12025551234 --message "Hello"',
    '<%= config.bin %> <%= command.id %> --to +19876543210 --message "Party time" --effect confetti',
  ];

  static override flags = {
    to: Flags.string({
      description: 'Recipient phone number (E.164 format)',
      required: true,
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
      description: 'iMessage effect (confetti, fireworks, lasers, etc.)',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Send);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);

    const from = flags.from;

    const client = createApiClient(token);

    // Build message parts
    const textPart: MessagePart = {
      type: 'text',
      value: flags.message,
    };

    // Build effect if specified
    let effect: MessageEffect | undefined;
    if (flags.effect) {
      effect = {
        type: 'screen',
        name: flags.effect,
      };
    }

    const { data, error } = await client.POST('/v3/chats', {
      body: {
        from,
        to: [flags.to],
        message: {
          parts: [textPart],
          effect,
        },
      },
    });

    if (error) {
      this.error(`Send failed: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Send failed: no response data');
    }

    this.log(
      `Message sent to ${flags.to} (chat: ${data.chat.id}, message: ${data.chat.message.id})`
    );
  }
}
