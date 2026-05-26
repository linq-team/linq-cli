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
  getDisplayTier,
  getLineType,
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

    if (process.stdout.isTTY) {
      await renderBanner();
      console.log('\n  Welcome to Linq CLI Setup\n');
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
    let email: string | undefined;
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
        email?: string | null;
        accountInfo?: {
          phones: { phoneNumber: string }[];
          accountLabel?: AccountLabel;
        } | null;
      };
      partnerId = acc.partnerId;
      orgId = acc.orgId;
      name = acc.name ?? undefined;
      email = acc.email ?? undefined;
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
      this.log(`Default Linq Number set to ${fromPhone} (only number on account)\n`);
    } else if (phones.length > 1) {
      if (accountLabel === 'Paid') {
        fromPhone = await select({
          message: 'Select a default Linq Number:',
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
      ...(email && { email }),
      accountLabel,
    });
    await setCurrentProfile(profileName);

    const tier = getDisplayTier(accountLabel);
    const line = getLineType(accountLabel);

    this.log(chalk.green('\n\u2713 You\'re set up!\n'));
    if (tier) this.log(`  ${chalk.dim('Tier:')}         ${tier}`);
    if (line) this.log(`  ${chalk.dim('Line:')}         ${line}`);
    if (fromPhone) this.log(`  ${chalk.dim('Linq Number:')}  ${chalk.bold(fromPhone)}`);
    if (name) this.log(`  ${chalk.dim('Name:')}         ${name}`);
    if (line === 'Shared') {
      this.log('');
      this.log(`  Shared line: add contacts with ${chalk.cyan('linq contacts add +1...')}, have them text you first, then reply.`);
    } else if (tier === 'Free') {
      this.log('');
      this.log('  Free line is inbound-first: have someone text your Linq Number first, then reply.');
    }
    this.log('\nNext steps:');
    this.log(`  ${chalk.cyan('linq chats create --to +1XXXXXXXXXX -m "Hello!"')}  ${chalk.dim('# Send a message')}`);
    this.log(`  ${chalk.cyan('linq webhooks listen')}${' '.repeat(33)}${chalk.dim('# Listen for events')}`);
    this.log(`  ${chalk.cyan('linq doctor')}${' '.repeat(42)}${chalk.dim('# Health check')}`);
  }
}
