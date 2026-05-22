import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireSharedLine } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import { addBreadcrumb } from '../../lib/telemetry.js';
import { bail, throwHttpError } from '../../lib/errors.js';

export default class ContactsAdd extends BaseCommand {
  static override description = 'Add a contact to your shared line';

  static override examples = [
    '<%= config.bin %> <%= command.id %> +12025551234',
  ];

  static override args = {
    phone: Args.string({ description: 'Contact phone number (E.164 format)', required: true }),
  };

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsAdd);
    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    requireSharedLine(config);

    const orgId = config.orgId;
    if (!orgId) {
      bail(this, flags.json, 'Not logged in. Run `linq signup` or `linq login`.');
    }

    try {
      const res = await fetch(`${BACKEND_URL}/cli/contacts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, contactPhone: args.phone }),
      });

      if (!res.ok) await throwHttpError(res);

      const data = await res.json() as { contactPhone: string };
      addBreadcrumb('Contact added');

      const blueNumber = config.fromPhone;

      if (flags.json) {
        this.log(JSON.stringify({
          contactPhone: data.contactPhone,
          blueNumber: blueNumber ?? null,
        }, null, 2));
        return;
      }

      this.log(chalk.green(`\n  ✓ Contact ${data.contactPhone} added.\n`));
      this.log(chalk.yellow('  Inbound-first: this contact must text your Blue Number before you can text them.\n'));
      if (blueNumber) {
        this.log(`  Text ${chalk.cyan(blueNumber)} from ${chalk.cyan(data.contactPhone)} to start the conversation.\n`);
      }
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
