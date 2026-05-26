import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  loadConfig,
  requireToken,
  isSessionExpired,
  getAccountLabel,
  getDisplayTier,
  getLineType,
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
      this.exit(1);
    }

    if (config.sessionExpiresAt && isSessionExpired(config)) {
      this.log(chalk.yellow(`\n  Your session has expired. Run ${chalk.cyan('linq login')} to re-authenticate.\n`));
      return;
    }

    const maskedToken = token.length > 12 ? `${token.slice(0, 12)}...` : token;
    const accountLabel = getAccountLabel(config);
    const tier = getDisplayTier(accountLabel);
    const line = getLineType(accountLabel);

    if (flags.json) {
      this.log(JSON.stringify({
        email: config.email,
        name: config.name,
        phone: config.fromPhone,
        apiKey: maskedToken,
        orgId: config.orgId,
        partnerId: config.partnerId,
        tier,
        line,
      }, null, 2));
      return;
    }

    this.log('');
    if (tier) this.log(`  ${chalk.dim('Tier:')}         ${tier}`);
    if (line) this.log(`  ${chalk.dim('Line:')}         ${line}`);
    if (config.name) this.log(`  ${chalk.dim('Name:')}         ${config.name}`);
    if (config.email) this.log(`  ${chalk.dim('Email:')}        ${config.email}  ${chalk.dim('(login)')}`);
    if (config.fromPhone) this.log(`  ${chalk.dim('Linq Number:')}  ${config.fromPhone}`);
    this.log(`  ${chalk.dim('API Key:')}      ${maskedToken}`);
    this.log('');
  }
}
