import { Command } from '@oclif/core';
import { password, select, confirm } from '@inquirer/prompts';
import { saveConfig } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';
import { LOGO } from '../lib/banner.js';

const INIT_BANNER = LOGO + '\n  Welcome to Linq CLI Setup\n';

export default class Init extends Command {
  static override description = 'Interactive setup wizard for Linq CLI';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    console.log(INIT_BANNER);

    this.log(
      'Get your API token from "Integration Details" in the Linq dashboard:'
    );
    this.log('https://zero.linqapp.com/api-tooling/\n');

    // Prompt for API token
    const token = await password({
      message: 'Enter your API token:',
      mask: '*',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return 'Token cannot be empty';
        }
        return true;
      },
    });

    // Validate token by calling the API
    this.log('\nValidating token...');
    const client = createApiClient(token.trim());

    const { data, error } = await client.GET('/v3/phonenumbers');

    if (error) {
      this.error(
        'Invalid token or API error. Please check your token and try again.'
      );
    }

    if (!data) {
      this.error('Failed to validate token: no response data');
    }

    this.log('\u2713 Token is valid!\n');

    // Select default phone number
    let fromPhone: string | undefined;
    const phones = data.phone_numbers;

    if (phones.length === 1) {
      fromPhone = phones[0].phone_number;
      this.log(`Default phone number set to ${fromPhone} (only number on account)\n`);
    } else if (phones.length > 1) {
      fromPhone = await select({
        message: 'Select a default phone number:',
        choices: phones.map((p) => ({
          name: p.phone_number,
          value: p.phone_number,
        })),
      });
      this.log('');
    }

    // Optional: ngrok setup
    let ngrokAuthtoken: string | undefined;

    const setupNgrok = await confirm({
      message:
        'Set up ngrok for webhook testing? (optional, can be done later)',
      default: false,
    });

    if (setupNgrok) {
      this.log(
        '\nGet your ngrok auth token from: https://dashboard.ngrok.com/get-started/your-authtoken\n'
      );

      ngrokAuthtoken = await password({
        message: 'Enter your ngrok auth token:',
        mask: '*',
        validate: (value) => {
          if (!value || value.trim() === '') {
            return 'Token cannot be empty';
          }
          return true;
        },
      });
      ngrokAuthtoken = ngrokAuthtoken.trim();
    }

    // Save config
    await saveConfig({
      token: token.trim(),
      ...(fromPhone && { fromPhone }),
      ...(ngrokAuthtoken && { ngrokAuthtoken }),
    });

    this.log('\n\u2713 Configuration saved to ~/.linq/config.json\n');
    this.log('Next steps:');
    this.log('  linq phonenumbers                                     List your phone numbers');
    this.log(
      '  linq chats create --to +1XXXXXXXXXX -m "Hello!"       Create a chat and send a message'
    );
    this.log('  linq doctor                                           Check your setup');
    if (!ngrokAuthtoken) {
      this.log(
        '  linq config set ngrokAuthtoken TOKEN   Set up ngrok later'
      );
    }
  }
}
