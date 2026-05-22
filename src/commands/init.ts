import { Flags } from '@oclif/core';
import { password, select, input } from '@inquirer/prompts';
import { BaseCommand } from '../lib/base-command.js';
import {
  saveProfile,
  setCurrentProfile,
  getCurrentProfile,
  listProfiles,
  SANDBOX_PROFILE,
  type AccountLabel,
} from '../lib/config.js';
import { BACKEND_URL } from '../lib/api-client.js';
import { renderBanner } from '../lib/banner.js';

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
      try {
        const chosen = await select({
          message: 'Which profile would you like to set up?',
          choices,
          default: current !== SANDBOX_PROFILE ? current : undefined,
        });
        profileName = chosen === '__new__'
          ? await input({ message: 'Profile name:', validate: v => v.trim() ? true : 'Name cannot be empty' })
          : chosen;
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          profileName = 'default';
        } else {
          throw error;
        }
      }
    }

    await renderBanner();
    console.log('\n  Welcome to Linq CLI Setup\n');

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

    this.log('\nValidating token...');
    let orgId: string | undefined;
    let name: string | undefined;
    let partnerId: string | undefined;
    let accountPhones: { phoneNumber: string }[] = [];
    let accountLabel: AccountLabel | undefined;

    try {
      const res = await fetch(`${BACKEND_URL}/cli/account-info`, {
        headers: { 'Authorization': `Bearer ${token.trim()}` },
      });
      if (res.status === 401) {
        this.error('Invalid or expired token. Generate a fresh one in the Dashboard or contact support@linqapp.com');
      }
      if (!res.ok) {
        this.error('Could not connect to Linq. Please try again later.');
      }
      const acc = await res.json() as {
        partnerId?: string;
        orgId?: string;
        name?: string | null;
        accountInfo?: {
          phones: { phoneNumber: string }[];
          accountLabel?: AccountLabel;
        } | null;
      };
      partnerId = acc.partnerId;
      orgId = acc.orgId;
      name = acc.name ?? undefined;
      accountPhones = acc.accountInfo?.phones ?? [];
      accountLabel = acc.accountInfo?.accountLabel;
    } catch (e) {
      if (e instanceof Error && 'oclif' in e) throw e;
      this.error('Could not connect to Linq. Please try again later.');
    }

    this.log('\u2713 Token is valid!\n');

    let fromPhone: string | undefined;
    const phones = accountPhones;

    if (phones.length === 1) {
      fromPhone = phones[0].phoneNumber;
      this.log(`Default Blue Number set to ${fromPhone} (only number on account)\n`);
    } else if (phones.length > 1) {
      if (accountLabel === 'Paid') {
        fromPhone = await select({
          message: 'Select a default Blue Number:',
          choices: phones.map((p) => ({
            name: p.phoneNumber,
            value: p.phoneNumber,
          })),
        });
        this.log('');
      } else {
        fromPhone = phones[0].phoneNumber;
      }
    }

    await saveProfile(profileName, {
      token: token.trim(),
      ...(fromPhone && { fromPhone }),
      ...(partnerId && { partnerId }),
      ...(orgId && { orgId }),
      ...(name && { name }),
      accountLabel,
    });
    await setCurrentProfile(profileName);

    this.log(`\n\u2713 Configuration saved to profile "${profileName}"\n`);
    this.log('Next steps:');
    this.log('  linq phonenumbers                                     List your Blue Numbers');
    this.log(
      '  linq chats create --to +1XXXXXXXXXX -m "Hello!"       Create a chat and send a message'
    );
    this.log('  linq webhooks listen                                  Listen for webhook events');
    this.log('  linq doctor                                           Check your setup');
  }
}
