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
import { createApiClient, BACKEND_URL } from '../lib/api-client.js';
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

    // Validate token by calling the API
    this.log('\nValidating token...');
    const client = createApiClient(token.trim());

    let data;
    try {
      data = await client.phoneNumbers.list();
    } catch {
      this.error(
        'Invalid token or API error. Please check your token and try again.'
      );
    }

    this.log('\u2713 Token is valid!\n');

    let orgId: string | undefined;
    let tier: number | undefined;
    let tenantType: string | undefined;
    let name: string | undefined;
    let partnerId: string | undefined;
    let accountPhones: { phoneNumber: string; tenantType: string }[] = [];
    try {
      const res = await fetch(`${BACKEND_URL}/cli/account-info`, {
        headers: { 'Authorization': `Bearer ${token.trim()}` },
      });
      if (res.ok) {
        const acc = await res.json() as {
          partnerId?: string;
          orgId?: string;
          name?: string | null;
          accountInfo?: { tier: number; phones: { phoneNumber: string; tenantType: string }[] } | null;
        };
        partnerId = acc.partnerId;
        orgId = acc.orgId;
        name = acc.name ?? undefined;
        tier = acc.accountInfo?.tier;
        accountPhones = acc.accountInfo?.phones ?? [];
      }
    } catch {
      // pass
    }

    let fromPhone: string | undefined;
    const synapsePhones = (data.phone_numbers || []).map(p => ({ phoneNumber: p.phone_number }));
    const phones = accountPhones.length > 0 ? accountPhones : synapsePhones;

    if (phones.length === 1) {
      fromPhone = phones[0].phoneNumber;
      this.log(`Default phone number set to ${fromPhone} (only number on account)\n`);
    } else if (phones.length > 1) {
      if ((tier ?? 0) >= 1) {
        fromPhone = await select({
          message: 'Select a default phone number:',
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

    if (accountPhones.length > 0) {
      tenantType = (fromPhone && accountPhones.find(p => p.phoneNumber === fromPhone)?.tenantType)
        ?? accountPhones[0].tenantType;
    }

    // Save to profile
    await saveProfile(profileName, {
      token: token.trim(),
      ...(fromPhone && { fromPhone }),
      ...(partnerId && { partnerId }),
      ...(orgId && { orgId }),
      ...(tier !== undefined && { tier }),
      ...(tenantType && { tenantType }),
      ...(name && { name }),
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
