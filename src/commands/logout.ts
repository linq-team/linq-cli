import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  loadConfigFile,
  saveConfigFile,
  getCurrentProfile,
} from '../lib/config.js';

export default class Logout extends BaseCommand {
  static override description = 'Clear local credentials (does not revoke your API key)';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to log out of (defaults to current)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Logout);

    const configFile = await loadConfigFile();
    const profileName = flags.profile || await getCurrentProfile();

    if (!configFile.profiles[profileName]) {
      this.log(chalk.yellow(`\n  Profile "${profileName}" not found.\n`));
      this.exit(1);
    }

    const profile = configFile.profiles[profileName];
    const email = profile?.email || '';

    // Clear everything
    configFile.profiles[profileName] = {};
    await saveConfigFile(configFile);

    this.log('');
    this.log(chalk.green('  \u2713 Logged out\n'));
    if (email) {
      this.log(chalk.dim(`  Cleared credentials for ${email}`));
    }
    this.log(chalk.dim('  Your API key is still valid. Use `linq login` to sign in again.'));
    this.log('');
  }
}
