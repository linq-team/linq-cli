import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken, requireSharedLine } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import { bail, throwHttpError } from '../../lib/errors.js';

export default class ContactsList extends BaseCommand {
  static override description = 'List contacts on your Shared line';

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

    requireSharedLine(config);

    const orgId = config.orgId;
    if (!orgId) {
      bail(this, flags.json, 'Not logged in. Run `linq signup` or `linq login`.');
    }

    try {
      const res = await fetch(`${BACKEND_URL}/cli/contacts?orgId=${encodeURIComponent(orgId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) await throwHttpError(res);

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
        const added = new Date(contact.createdAt).toISOString().slice(0, 10);
        this.log(`  ${contact.contactPhone}  ${chalk.dim(`added ${added}`)}`);
      }
      this.log('');
    } catch (e) {
      bail(this, flags.json, e);
    }
  }
}
