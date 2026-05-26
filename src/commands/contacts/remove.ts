import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireSharedLine } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import { addBreadcrumb } from '../../lib/telemetry.js';
import { bail, throwHttpError } from '../../lib/errors.js';

export default class ContactsRemove extends BaseCommand {
  static override description = 'Remove a contact from your Shared line';

  static override examples = [
    '<%= config.bin %> <%= command.id %> +12025551234',
  ];

  static override args = {
    phone: Args.string({ description: 'Contact phone number to remove', required: true }),
  };

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsRemove);
    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    requireSharedLine(config);

    const orgId = config.orgId;
    if (!orgId) {
      bail(this, flags.json, 'Not logged in. Run `linq signup` or `linq login`.');
    }

    try {
      const res = await fetch(`${BACKEND_URL}/cli/contacts/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, contactPhone: args.phone }),
      });

      if (!res.ok) await throwHttpError(res);

      addBreadcrumb('Contact removed');

      if (flags.json) {
        this.log(JSON.stringify({ contactPhone: args.phone, removed: true }, null, 2));
        return;
      }

      this.log(chalk.green(`\n  ✓ Contact ${args.phone} removed.\n`));
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
