import { Command, Flags } from '@oclif/core';
import { password } from '@inquirer/prompts';
import { loadConfig, saveConfig } from '../lib/config.js';
import { LOGO } from '../lib/banner.js';

const LOGIN_BANNER = LOGO + '\n  Welcome to Linq CLI\n';

export default class Login extends Command {
  static override description = 'Authenticate with Linq';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --token YOUR_API_TOKEN',
  ];

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token from Linq dashboard',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let token = flags.token;

    if (!token) {
      console.log(LOGIN_BANNER);
      this.log(
        'Get your API token from "Integration Details" in the Linq dashboard:'
      );
      this.log('https://zero.linqapp.com/api-tooling/\n');

      token = await password({
        message: 'Enter your API token:',
        mask: '*',
        validate: (value) => {
          if (!value || value.trim() === '') {
            return 'Token cannot be empty';
          }
          return true;
        },
      });
    }

    token = token.trim();

    if (!token) {
      this.error('Token cannot be empty');
    }

    const config = await loadConfig();
    config.token = token;
    await saveConfig(config);

    this.log('Token saved to ~/.linq/config.json');
  }
}
