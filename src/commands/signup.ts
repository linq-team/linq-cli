import { Flags } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import { renderBanner } from '../lib/banner.js';
import { runAuthFlow, checkExistingSession } from '../lib/auth-flow.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class Signup extends BaseCommand {
  static override description = 'Create a Linq developer account and get a shared Blue Number';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --email dev@example.com',
    '<%= config.bin %> <%= command.id %> --email dev@example.com --code 123456 --name "Dev User"',
  ];

  static override flags = {
    email: Flags.string({
      char: 'e',
      description: 'Email address',
    }),
    code: Flags.string({
      char: 'c',
      description: 'OTP verification code from your email (skips interactive prompt; pair with --email and --name for non-interactive signup)',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Your name (skips interactive prompt during signup)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Signup);

    const existing = await checkExistingSession();
    if (existing) {
      this.log(chalk.yellow(`\n  You're already logged in as ${chalk.bold(existing)}.`));
      this.log(chalk.dim(`  Run ${chalk.cyan('linq logout')} to switch accounts.\n`));
      return;
    }

    // Skip the banner for AI agents / scripts (no TTY) or when all the
    // signup flags are supplied (fully scripted run).
    const nonInteractive = !!(flags.email && flags.code && flags.name);
    const showBanner = !nonInteractive && process.stdout.isTTY;
    if (showBanner) {
      await renderBanner();
      console.log('\n  Create your Linq developer account\n');
    }

    let email = flags.email;
    if (email) {
      if (!EMAIL_REGEX.test(email.trim())) {
        this.error(`Invalid email: ${email}`);
      }
    } else {
      try {
        email = await input({
          message: 'Email address:',
          validate: (v) => {
            if (!v.trim()) return 'Email is required';
            if (!EMAIL_REGEX.test(v.trim())) return 'Enter a valid email';
            return true;
          },
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          this.exit(1);
        }
        throw error;
      }
    }
    email = email.trim().toLowerCase();

    if (flags.code && !/^\d{6}$/.test(flags.code.trim())) {
      this.error(`Invalid --code: must be a 6-digit number`);
    }

    await runAuthFlow({
      email,
      code: flags.code?.trim(),
      name: flags.name?.trim(),
      log: (msg) => this.log(msg),
      exit: (code) => this.exit(code),
      parseError: (res) => this.parseError(res),
    });
  }

  private async parseError(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      return body.message || body.error || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  }
}
