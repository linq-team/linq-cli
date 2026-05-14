import { Flags } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import { LOGO } from '../lib/banner.js';
import { runAuthFlow, checkExistingSession } from '../lib/auth-flow.js';

const LOGIN_BANNER = LOGO + '\n  Welcome back to Linq CLI\n';

export default class Login extends BaseCommand {
  static override description = 'Authenticate with Linq';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --email dev@example.com',
  ];

  static override flags = {
    email: Flags.string({
      char: 'e',
      description: 'Email address for OTP login',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    const existing = await checkExistingSession();
    if (existing) {
      this.log(chalk.yellow(`\n  You're already logged in as ${chalk.bold(existing)}.`));
      this.log(chalk.dim(`  Run ${chalk.cyan('linq logout')} to switch accounts.\n`));
      return;
    }

    console.log(LOGIN_BANNER);

    let email = flags.email;
    if (!email) {
      try {
        email = await input({
          message: 'Email address:',
          validate: (v) => {
            if (!v.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email';
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

    await runAuthFlow({
      email,
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
