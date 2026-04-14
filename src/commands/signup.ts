import { Flags } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { BaseCommand } from '../lib/base-command.js';
import { LOGO } from '../lib/banner.js';
import { runAuthFlow } from '../lib/auth-flow.js';

const SIGNUP_BANNER = LOGO + '\n  Create your Linq developer account\n';

export default class Signup extends BaseCommand {
  static override description = 'Create a Linq developer account and get a shared phone line';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --email dev@example.com',
  ];

  static override flags = {
    email: Flags.string({
      char: 'e',
      description: 'Email address',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Signup);

    console.log(SIGNUP_BANNER);

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
