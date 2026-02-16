import { Flags } from '@oclif/core';
import { password, select, input } from '@inquirer/prompts';
import { BaseCommand } from '../lib/base-command.js';
import {
  saveProfile,
  setCurrentProfile,
  getCurrentProfile,
  listProfiles,
  SANDBOX_PROFILE,
} from '../lib/config.js';
import { fetchPartnerId } from '../lib/partner.js';
import { createApiClient } from '../lib/api-client.js';
import { LOGO } from '../lib/banner.js';

const INIT_BANNER = LOGO + '\n  Welcome to Linq CLI Setup\n';

export default class Init extends BaseCommand {
  static override description = 'Interactive setup wizard for Linq CLI';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --profile work',
  ];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to save credentials to',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Init);

    let profileName = flags.profile;

    if (profileName === SANDBOX_PROFILE) {
      this.error(`The "${SANDBOX_PROFILE}" profile is reserved for \`linq signup\`. Use --profile <name> to init a different profile.`);
    }

    if (!profileName) {
      const current = await getCurrentProfile() || 'default';
      const profiles = (await listProfiles()).filter(p => p !== SANDBOX_PROFILE);
      const choices = [
        ...profiles.map(p => ({
          name: p === current ? `${p} (active)` : p,
          value: p,
        })),
        { name: 'Create new profile', value: '__new__' },
      ];
      const chosen = await select({
        message: 'Which profile would you like to set up?',
        choices,
        default: current !== SANDBOX_PROFILE ? current : undefined,
      });
      profileName = chosen === '__new__'
        ? await input({ message: 'Profile name:', validate: v => v.trim() ? true : 'Name cannot be empty' })
        : chosen;
    }

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

    // Fetch partner ID
    const partnerId = await fetchPartnerId(token.trim());

    // Save to profile
    await saveProfile(profileName, {
      token: token.trim(),
      ...(fromPhone && { fromPhone }),
      ...(partnerId && { partnerId }),
    });
    await setCurrentProfile(profileName);

    this.log(`\n\u2713 Configuration saved to profile "${profileName}"\n`);
    this.log('Next steps:');
    this.log('  linq phonenumbers                                     List your phone numbers');
    this.log(
      '  linq chats create --to +1XXXXXXXXXX -m "Hello!"       Create a chat and send a message'
    );
    this.log('  linq webhooks listen                                  Listen for webhook events');
    this.log('  linq doctor                                           Check your setup');
  }
}
