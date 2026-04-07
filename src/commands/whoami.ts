import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  loadConfig,
  requireToken,
  isSessionExpired,
} from '../lib/config.js';

export default class Whoami extends BaseCommand {
  static override description = 'Show current identity and account info';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Whoami);

    const config = await loadConfig(flags.profile);

    let token: string;
    try {
      token = requireToken(flags.token, config);
    } catch {
      this.log(chalk.yellow(`\n  Not logged in. Run ${chalk.cyan('linq signup')} or ${chalk.cyan('linq login')}.\n`));
      return;
    }

    // Check session expiry
    const expired = isSessionExpired(config);
    if (expired) {
      this.log(chalk.yellow(`\n  Your session has expired. Run ${chalk.cyan('linq login')} to re-authenticate.\n`));
      return;
    }

    const info: Record<string, string | undefined> = {
      email: config.email,
      name: config.name,
      phone: config.fromPhone,
      apiKey: token,
    };

    if (flags.json) {
      this.log(JSON.stringify(info, null, 2));
      return;
    }

    // Derive account label
    let accountLabel = '';
    const tier = config.tier;
    const tenantType = config.tenantType;
    if (tier === 0 && tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
    else if (tier === 0 && tenantType === 'MULTI') accountLabel = 'Shared Line';
    else if (tier !== undefined && tier >= 1) accountLabel = 'Paid';

    this.log('');
    if (accountLabel) this.log(`  ${chalk.dim('Account:')}    ${accountLabel}`);
    if (info.name) this.log(`  ${chalk.dim('Name:')}       ${info.name}`);
    if (info.email) this.log(`  ${chalk.dim('Email:')}      ${info.email}`);
    this.log(`  ${chalk.dim('Phone:')}      ${info.phone || chalk.dim('not set')}`);
    this.log(`  ${chalk.dim('API Key:')}    ${info.apiKey}`);
    if (!info.phone) {
      this.log(`\n  ${chalk.dim('You have multiple phone numbers. Run')} ${chalk.cyan('linq phonenumbers set')} ${chalk.dim('to pick a default.')}`);
    }
    this.log('');
  }
}
