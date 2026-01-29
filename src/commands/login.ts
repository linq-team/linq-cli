import { Command, Flags } from '@oclif/core';
import { password } from '@inquirer/prompts';
import { loadConfig, saveConfig } from '../lib/config.js';

export default class Login extends Command {
  static override description = 'Authenticate with Linq';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --token YOUR_API_TOKEN',
  ];

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token to store',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let token = flags.token;

    if (!token) {
      token = await password({
        message: 'Enter your Linq API token:',
        mask: '*',
      });
    }

    if (!token || token.trim() === '') {
      this.error('Token cannot be empty');
    }

    token = token.trim();

    // Load existing config to preserve other settings
    const config = await loadConfig();
    config.token = token;

    await saveConfig(config);

    this.log('Authenticated successfully. Token saved to ~/.linq/config.json');
  }
}
