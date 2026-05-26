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

    // Show banner up front for interactive runs (skip when --token is
    // passed — that path is for scripts / AI agents and shouldn't get
    // animated decoration cluttering their logs).
    if (!flags.token && process.stdout.isTTY) {
      await renderBanner();
      console.log('\n  Welcome back to Linq CLI\n');
    }

    if (!profileName) {
      // If --token was supplied, assume non-interactive (script / AI
      // agent) — pick the current/default profile silently. Only the
      // bare `linq login` interactive flow gets the profile picker.
      if (flags.token) {
        profileName = (await getCurrentProfile()) || 'default';
      } else {
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
    }

    let token = flags.token;
    if (!token) {
      if (!process.stdin.isTTY) {
        this.error('linq login needs a terminal for the interactive token prompt. To run non-interactively, pass --token: linq login --token <your-token>');
      }
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

    this.log('\nValidating token...');
    let orgId: string | undefined;
    let name: string | undefined;
    let email: string | undefined;
    let partnerId: string | undefined;
    let accountPhones: { phoneNumber: string }[] = [];
    let accountLabel: AccountLabel | undefined;

    try {
      const res = await fetch(`${BACKEND_URL}/cli/account-info`, {
        headers: { Authorization: `Bearer ${token}` },
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

    this.log(`${chalk.green('✓')} Token is valid!\n`);

    let fromPhone: string | undefined;
    const phones = accountPhones;

    if (phones.length === 1) {
      fromPhone = phones[0].phoneNumber;
    } else if (phones.length > 1) {
      if (accountLabel === 'Paid') {
        try {
          fromPhone = await select({
            message: 'Select a default Linq Number:',
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

    await saveProfile(profileName, {
      token,
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

    this.log(chalk.green('✓ Welcome back!\n'));
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
    this.log('');
  }
}
