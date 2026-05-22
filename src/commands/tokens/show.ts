import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig } from '../../lib/config.js';
import { copyToClipboard } from '../../lib/clipboard.js';

export default class TokensShow extends BaseCommand {
  static override description = 'Print the API token currently saved in your local config';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --copy',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to read from' }),
    copy: Flags.boolean({ description: 'Copy the token to clipboard instead of printing it' }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TokensShow);
    const config = await loadConfig(flags.profile);

    if (!config.token) {
      this.log(chalk.yellow(`\n  No token saved. Run ${chalk.cyan('linq signup')} or ${chalk.cyan('linq login')}.\n`));
      return;
    }

    if (flags.json) {
      this.log(JSON.stringify({ token: config.token }, null, 2));
      return;
    }

    if (flags.copy) {
      const copied = await copyToClipboard(config.token);
      if (copied) {
        this.log(chalk.green('\n  ✓ Token copied to clipboard.\n'));
      } else {
        this.log(chalk.yellow(`\n  Could not access clipboard. Token:\n\n    ${chalk.bold(config.token)}\n`));
      }
      return;
    }

    this.log('');
    this.log(`  ${chalk.bold(config.token)}`);
    this.log('');
    this.log(chalk.dim(`  Tip: ${chalk.cyan('linq tokens show --copy')} copies it to your clipboard.`));
    this.log('');
  }
}
