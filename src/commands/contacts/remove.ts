import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';

export default class ContactsRemove extends BaseCommand {
  static override description = 'Remove a contact from your shared line';

  static override examples = [
    '<%= config.bin %> <%= command.id %> +12025551234',
  ];

  static override args = {
    phone: Args.string({ description: 'Contact phone number to remove', required: true }),
  };

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsRemove);
    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    const orgId = config.orgId;
    const tier = config.tier;
    const tenantType = config.tenantType;

    if (tier === 0 && tenantType === 'SINGLE') {
      this.log(chalk.yellow('\n  This command is for shared line accounts only.'));
      this.log(chalk.dim('  Your sandbox account can text any number directly (an inbound message is needed first).\n'));
      this.exit(1);
    }

    if (tier && tier >= 1) {
      this.log(chalk.yellow('\n  This command is for shared line accounts only.'));
      this.log(chalk.dim('  Your account can text any number directly — no contacts needed.\n'));
      this.exit(1);
    }

    if (!orgId) {
      this.log(chalk.yellow('\n  Not logged in. Run linq signup or linq login first.\n'));
      this.exit(1);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/cli/contacts/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, contactPhone: args.phone }),
      });

      if (!res.ok) {
        const err = await res.json() as { message?: string };
        this.log(chalk.red(`\n  ${err.message || 'Failed to remove contact'}\n`));
        this.exit(1);
      }

      this.log(chalk.green(`\n  \u2713 Contact ${args.phone} removed.\n`));
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
    }
  }
}
