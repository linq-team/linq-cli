import { Flags } from '@oclif/core';
import { password, select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  saveProfile,
  setCurrentProfile,
  getCurrentProfile,
  listProfiles,
  SANDBOX_PROFILE,
} from '../lib/config.js';
import { createApiClient, BACKEND_URL } from '../lib/api-client.js';
import { LOGO } from '../lib/banner.js';

const LOGIN_BANNER = LOGO + '\n  Welcome back to Linq CLI\n';

export default class Login extends BaseCommand {
  static override description = 'Authenticate with Linq using an API token';

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
      description: 'API token from the Linq dashboard',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let profileName = flags.profile;

    if (profileName === SANDBOX_PROFILE) {
      this.error(`The "${SANDBOX_PROFILE}" profile is reserved for \`linq signup\`. Use --profile <name> to log in to a different profile.`);
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
          message: 'Which profile would you like to log in to?',
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

    let token = flags.token;
    if (!token) {
      console.log(LOGIN_BANNER);
      try {
        token = await password({
          message: 'Enter your API token:',
          mask: '*',
          validate: (v) => (v && v.trim() ? true : 'Token cannot be empty'),
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          this.exit(1);
        }
        throw error;
      }
    }
    token = token.trim();
    if (!token) this.error('Token cannot be empty');

    // Validate the token by hitting synapse
    this.log('\nValidating token...');
    const client = createApiClient(token);
    let data;
    try {
      data = await client.phoneNumbers.list();
    } catch {
      this.error('Invalid token or API error. Please check your token and try again.');
    }
    this.log(`${chalk.green('✓')} Token is valid!\n`);

    let orgId: string | undefined;
    let tier: number | undefined;
    let tenantType: string | undefined;
    let name: string | undefined;
    let partnerId: string | undefined;
    let accountPhones: { phoneNumber: string; tenantType: string }[] = [];
    try {
      const res = await fetch(`${BACKEND_URL}/cli/account-info`, {
        headers: { Authorization: `Bearer ${token}` },
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
    } else if (phones.length > 1) {
      if ((tier ?? 0) >= 1) {
        try {
          fromPhone = await select({
            message: 'Select a default phone number:',
            choices: phones.map(p => ({ name: p.phoneNumber, value: p.phoneNumber })),
          });
        } catch (error) {
          if (error instanceof Error && error.name === 'ExitPromptError') {
            this.exit(1);
          }
          throw error;
        }
      } else {
        fromPhone = phones[0].phoneNumber;
      }
    }

    if (accountPhones.length > 0) {
      tenantType = (fromPhone && accountPhones.find(p => p.phoneNumber === fromPhone)?.tenantType)
        ?? accountPhones[0].tenantType;
    }

    await saveProfile(profileName, {
      token,
      ...(fromPhone && { fromPhone }),
      ...(partnerId && { partnerId }),
      ...(orgId && { orgId }),
      ...(tier !== undefined && { tier }),
      ...(tenantType && { tenantType }),
      ...(name && { name }),
    });
    await setCurrentProfile(profileName);

    let accountLabel = '';
    if (tier === 0 && tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
    else if (tier === 0 && tenantType === 'MULTI') accountLabel = 'Shared Line';
    else if ((tier ?? 0) >= 1) accountLabel = 'Paid';

    this.log(chalk.green('✓ Welcome back!\n'));
    if (accountLabel) this.log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
    if (fromPhone) this.log(`  ${chalk.dim('Phone:')}    ${chalk.bold(fromPhone)}`);
    if (name) this.log(`  ${chalk.dim('Name:')}     ${name}`);
    this.log(`  ${chalk.dim('Profile:')}  ${profileName}`);
    this.log('');
  }
}
