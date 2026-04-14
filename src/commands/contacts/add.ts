import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireSharedLine } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import { addBreadcrumb } from '../../lib/telemetry.js';

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
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsAdd);
    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    requireSharedLine(config);

    const orgId = config.orgId;
    if (!orgId) {
      this.log(chalk.yellow('\n  Not logged in. Run linq signup or linq login first.\n'));
      this.exit(1);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/cli/contacts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, contactPhone: args.phone }),
      });

      if (!res.ok) {
        const err = await res.json() as { message?: string };
        this.log(chalk.red(`\n  ${err.message || 'Failed to add contact'}\n`));
        this.exit(1);
      }

      const data = await res.json() as { contactPhone: string };
      addBreadcrumb('Contact added');
      this.log(chalk.green(`\n  \u2713 Contact ${data.contactPhone} added.\n`));
      this.log(chalk.dim('  Note: this contact must send a message to your Linq number first before you can reply.\n'));
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
    }
  }
}
