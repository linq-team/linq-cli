import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';

export default class ContactsList extends BaseCommand {
  static override description = 'List contacts on your shared line';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsList);
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
      const res = await fetch(`${BACKEND_URL}/cli/contacts?orgId=${encodeURIComponent(orgId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json() as { message?: string };
        this.log(chalk.red(`\n  ${err.message || 'Failed to list contacts'}\n`));
        this.exit(1);
      }

      const data = await res.json() as {
        contacts: { contactPhone: string; createdAt: string }[];
      };

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
        return;
      }

      if (data.contacts.length === 0) {
        this.log('\n  No contacts yet.\n');
        this.log(chalk.dim('  Add a contact: linq contacts add +12025551234\n'));
        return;
      }

      this.log(`\n  ${chalk.bold('Your contacts')} (${data.contacts.length})\n`);
      for (const contact of data.contacts) {
        const added = new Date(contact.createdAt).toLocaleDateString();
        this.log(`  ${contact.contactPhone}  ${chalk.dim(`added ${added}`)}`);
      }
      this.log('');
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
    }
  }
}
