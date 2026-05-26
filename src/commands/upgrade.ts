import { Flags } from '@oclif/core';
import open from 'open';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import { loadConfig, getAccountLabel, getDisplayTier } from '../lib/config.js';

const UPGRADE_URL = 'https://linqapp.com/s/talk-to-an-expert';
const SUPPORT_EMAIL = 'support@linqapp.com';
const PAID_MESSAGE =
  'Please contact your Linq Account Manager to add more lines or email support@linqapp.com.';

export default class Upgrade extends BaseCommand {
  static override description = 'Upgrade your Linq plan';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use' }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Upgrade);
    const config = await loadConfig(flags.profile);
    const tier = getDisplayTier(getAccountLabel(config));

    if (tier === 'Paid') {
      if (flags.json) {
        this.log(JSON.stringify({
          tier: 'Paid',
          action: 'contact',
          message: PAID_MESSAGE,
          supportEmail: SUPPORT_EMAIL,
        }, null, 2));
        return;
      }
      this.log(chalk.green('\n  ✓ You\'re already on Paid.\n'));
      this.log(`  ${PAID_MESSAGE}\n`);
      return;
    }

    // Free (or unknown — treat as Free since this is the upgrade path)
    if (flags.json) {
      this.log(JSON.stringify({
        tier: tier ?? 'Free',
        action: 'open',
        url: UPGRADE_URL,
      }, null, 2));
      return;
    }

    this.log(`\n  Opening ${chalk.cyan(UPGRADE_URL)}\n`);
    if (process.stdout.isTTY) {
      try {
        await open(UPGRADE_URL);
      } catch {
        // Silent — URL is already printed so the user can copy it.
      }
    }
  }
}
