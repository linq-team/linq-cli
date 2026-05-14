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
    profile: Flags.string({ char: 'p', description: 'Config profile to use' }),
    token: Flags.string({ char: 't', description: 'API token' }),
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

    // Check session expiry (only for signup/login users who have sessionExpiresAt)
    if (config.sessionExpiresAt && isSessionExpired(config)) {
      this.log(chalk.yellow(`\n  Your session has expired. Run ${chalk.cyan('linq login')} to re-authenticate.\n`));
      return;
    }

    if (flags.json) {
      this.log(JSON.stringify({
        email: config.email,
        name: config.name,
        phone: config.fromPhone,
        apiKey: token,
        tier: config.tier,
        tenantType: config.tenantType,
      }, null, 2));
      return;
    }

    this.log('');

    // Signup/login users have tier set
    if (config.tier !== undefined) {
      let accountLabel = '';
      if (config.tier === 0 && config.tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
      else if (config.tier === 0 && config.tenantType === 'MULTI') accountLabel = 'Shared Line';
      else if (config.tier >= 1) accountLabel = 'Paid';

      if (accountLabel) this.log(`  ${chalk.dim('Account:')}    ${accountLabel}`);
      if (config.name) this.log(`  ${chalk.dim('Name:')}       ${config.name}`);
      if (config.email) this.log(`  ${chalk.dim('Email:')}      ${config.email}`);
      if (config.fromPhone) this.log(`  ${chalk.dim('Phone:')}      ${config.fromPhone}`);
      this.log(`  ${chalk.dim('API Key:')}    ${token}`);
    } else {
      // Token-only users (init / paid customers)
      if (config.name) this.log(`  ${chalk.dim('Name:')}       ${config.name}`);
      if (config.email) this.log(`  ${chalk.dim('Email:')}      ${config.email}`);
      if (config.fromPhone) this.log(`  ${chalk.dim('Phone:')}      ${config.fromPhone}`);
      this.log(`  ${chalk.dim('API Key:')}    ${token}`);
    }

    this.log('');
  }
}
