import { Flags } from '@oclif/core';
import { BaseCommand } from '../lib/base-command.js';
import { loadConfig, requireToken } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';
import { formatPhoneNumbers } from '../lib/format.js';
import { parseApiError } from '../lib/errors.js';

export default class PhoneNumbers extends BaseCommand {
  static override description = 'List your available phone numbers';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
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
    const { flags } = await this.parse(PhoneNumbers);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/phonenumbers');

    if (error) {
      this.error(`Failed to list phone numbers: ${parseApiError(error)}`);
    }

    if (!data) {
      this.error('Failed to list phone numbers: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      this.log(formatPhoneNumbers(data));
    }
  }
}
