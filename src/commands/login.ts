import { Flags } from '@oclif/core';
import { password, select, input } from '@inquirer/prompts';
import { BaseCommand } from '../lib/base-command.js';
import { fetchPartnerId } from '../lib/partner.js';
import {
  saveProfile,
  setCurrentProfile,
  getCurrentProfile,
  listProfiles,
  SANDBOX_PROFILE,
} from '../lib/config.js';
import { LOGO } from '../lib/banner.js';

const LOGIN_BANNER = LOGO + '\n  Welcome to Linq CLI\n';

export default class Login extends BaseCommand {
  static override description = 'Authenticate with Linq';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --token YOUR_API_TOKEN',
    '<%= config.bin %> <%= command.id %> --profile work',
  ];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to save credentials to',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token from Linq dashboard',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let profileName = flags.profile;

    if (profileName === SANDBOX_PROFILE) {
      this.error(`The "${SANDBOX_PROFILE}" profile is reserved for \`linq signup\`. Use --profile <name> to login to a different profile.`);
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
        message: 'Which profile would you like to log in to?',
        choices,
        default: current !== SANDBOX_PROFILE ? current : undefined,
      });
      profileName = chosen === '__new__'
        ? await input({ message: 'Profile name:', validate: v => v.trim() ? true : 'Name cannot be empty' })
        : chosen;
    }

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

    const profile: { token: string; partnerId?: string } = { token };

    const partnerId = await fetchPartnerId(token);
    if (partnerId) {
      profile.partnerId = partnerId;
    }

    await saveProfile(profileName, profile);
    await setCurrentProfile(profileName);

    this.log(`Token saved to profile "${profileName}"`);
  }
}
