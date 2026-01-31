import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';

export default class PhoneNumbers extends Command {
  static override description = 'List your available phone numbers';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PhoneNumbers);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);

    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/phonenumbers');

    if (error) {
      this.error(`Failed to list phone numbers: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list phone numbers: no response data');
    }

    const numbers = data.phone_numbers;

    if (numbers.length === 0) {
      this.log(
        'No phone numbers available. Contact Linq to provision numbers for your account.'
      );
      return;
    }

    // Print table header
    this.log(`${'NUMBER'.padEnd(18)} ${'TYPE'.padEnd(10)} ${'SMS'.padEnd(5)}`);
    this.log(`${'------'.padEnd(18)} ${'----'.padEnd(10)} ${'---'.padEnd(5)}`);

    // Print each number
    for (const n of numbers) {
      const sms = n.capabilities.sms ? 'yes' : 'no';
      this.log(
        `${n.phone_number.padEnd(18)} ${n.type.padEnd(10)} ${sms.padEnd(5)}`
      );
    }
  }
}
