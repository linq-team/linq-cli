import { password, select } from '@inquirer/prompts';
import { BaseCommand } from '../lib/base-command.js';
import { saveConfig } from '../lib/config.js';
import { createLinqClient } from '../lib/api-client.js';
import { LOGO } from '../lib/banner.js';

const INIT_BANNER = LOGO + '\n  Welcome to Linq CLI Setup\n';

export default class Init extends BaseCommand {
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
    const client = createLinqClient(token.trim());

    let data;
    try {
      data = await client.phoneNumbers.listPhoneNumbers();
    } catch {
      this.error(
        'Invalid token or API error. Please check your token and try again.'
      );
    }

    this.log('\u2713 Token is valid!\n');

    // Select default phone number
    let fromPhone: string | undefined;
    const phones = data.phoneNumbers;

    if (phones.length === 1) {
      fromPhone = phones[0].phoneNumber;
      this.log(`Default phone number set to ${fromPhone} (only number on account)\n`);
    } else if (phones.length > 1) {
      fromPhone = await select({
        message: 'Select a default phone number:',
        choices: phones.map((p) => ({
          name: p.phoneNumber,
          value: p.phoneNumber,
        })),
      });
      this.log('');
    }

    // Save config
    await saveConfig({
      token: token.trim(),
      ...(fromPhone && { fromPhone }),
    });

    this.log('\n\u2713 Configuration saved to ~/.linq/config.json\n');
    this.log('Next steps:');
    this.log('  linq phonenumbers                                     List your phone numbers');
    this.log(
      '  linq chats create --to +1XXXXXXXXXX -m "Hello!"       Create a chat and send a message'
    );
    this.log('  linq webhooks listen                                  Listen for webhook events');
    this.log('  linq doctor                                           Check your setup');
  }
}
