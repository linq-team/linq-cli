import { Flags, ux } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  saveProfile,
  saveSandboxProfile,
  setCurrentProfile,
  getCurrentProfile,
  listProfiles,
  SANDBOX_PROFILE,
  Profile,
} from '../lib/config.js';
import { LOGO } from '../lib/banner.js';
import { BACKEND_URL } from '../lib/api-client.js';
import { addBreadcrumb } from '../lib/telemetry.js';

const SESSION_DURATION_DAYS = 7;

const LOGIN_BANNER = LOGO + '\n  Welcome back to Linq CLI\n';

export default class Login extends BaseCommand {
  static override description = 'Authenticate with Linq';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --email dev@example.com',
  ];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to save credentials to',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (skip email verification)',
    }),
    email: Flags.string({
      char: 'e',
      description: 'Email address for OTP login',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    // Token login (power user / existing paid customer)
    if (flags.token) {
      await this.tokenLogin(flags.token, flags.profile);
      return;
    }

    console.log(LOGIN_BANNER);

    // Email + OTP login
    let email = flags.email;
    if (!email) {
      try {
        email = await input({
          message: 'Email address:',
          validate: (v) => {
            if (!v.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email';
            return true;
          },
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          this.exit(1);
        }
        throw error;
      }
    }
    email = email.trim().toLowerCase();

    // Step 1: Send OTP
    ux.action.start('Sending verification code');

    let sessionId: string;
    try {
      const otpRes = await fetch(`${BACKEND_URL}/cli/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!otpRes.ok) {
        ux.action.stop('failed');
        const err = await this.parseError(otpRes);
        this.log(chalk.red(`\n  ${err}\n`));
        this.exit(1);
      }

      const data = (await otpRes.json()) as { sessionId: string };
      sessionId = data.sessionId;
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
      return;
    }
    ux.action.stop('sent!');
    this.log(`  Check ${chalk.bold(email)} for your verification code.\n`);

    // Step 2: Collect + verify OTP
    let code: string;
    try {
      code = await input({
        message: 'Verification code:',
        validate: (v) => {
          if (!/^\d{6}$/.test(v.trim())) return 'Enter the 6-digit code from your email';
          return true;
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ExitPromptError') {
        this.exit(1);
      }
      throw error;
    }

    ux.action.start('Logging in');

    try {
      const verifyRes = await fetch(`${BACKEND_URL}/cli/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: code.trim() }),
      });

      if (!verifyRes.ok) {
        ux.action.stop('failed');
        const err = await this.parseError(verifyRes);
        this.log(chalk.red(`\n  ${err}\n`));
        this.exit(1);
      }

      const verifyResult = (await verifyRes.json()) as {
        status: 'existing' | 'new';
        token?: string;
        orgId?: string;
        email: string;
        name?: string;
        accountInfo?: {
          tier: number;
          phones: { phoneNumber: string; tenantType: string }[];
        } | null;
      };
      ux.action.stop('done!');

      if (verifyResult.status === 'new') {
        this.log(chalk.yellow(`\n  No account found for ${email}.`));
        this.log(`  Run ${chalk.cyan('linq signup')} to create one and get a shared line.\n`);
        this.exit(1);
        return;
      }

      // Existing user — save credentials
      const phones = verifyResult.accountInfo?.phones || [];
      const tier = verifyResult.accountInfo?.tier ?? 0;
      let phoneNumber = '';
      let multiplePhones = false;
      let accountLabel = '';

      if (phones.length === 1) {
        phoneNumber = phones[0].phoneNumber;
        if (tier === 0 && phones[0].tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
        else if (tier === 0 && phones[0].tenantType === 'MULTI') accountLabel = 'Shared Line';
        else if (tier >= 1) accountLabel = 'Paid';
      } else if (phones.length > 1) {
        multiplePhones = true;
        accountLabel = tier >= 1 ? 'Paid' : 'Shared Line';
      }

      const targetProfile = flags.profile || await getCurrentProfile() || 'default';
      const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const profileData: Profile = {
        token: verifyResult.token,
        fromPhone: phoneNumber,
        orgId: verifyResult.orgId,
        email: verifyResult.email,
        name: verifyResult.name,
        tier,
        tenantType: phones.length === 1 ? phones[0].tenantType : phones.length > 1 ? 'SINGLE' : undefined,
        sessionExpiresAt,
      };

      if (targetProfile === SANDBOX_PROFILE) {
        await saveSandboxProfile(profileData);
      } else {
        await saveProfile(targetProfile, profileData);
      }
      await setCurrentProfile(targetProfile);

      addBreadcrumb('Login successful', { accountType: accountLabel || 'unknown' });
      this.log('');
      this.log(chalk.green('  \u2713 Logged in!\n'));
      if (accountLabel) this.log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
      if (multiplePhones) {
        this.log(`  ${chalk.dim('Phone:')}    ${chalk.yellow(`${phones.length} phones available`)}`);
        this.log(`             Run ${chalk.cyan('linq phonenumbers set')} to pick a default.`);
      } else {
        this.log(`  ${chalk.dim('Phone:')}    ${chalk.bold(phoneNumber || 'none')}`);
      }
      this.log(`  ${chalk.dim('Email:')}    ${verifyResult.email}`);
      this.log(`  ${chalk.dim('API Key:')}  ${verifyResult.token}`);
      this.log('');
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
    }
  }

  /**
   * Token-based login for power users / paid customers.
   */
  private async tokenLogin(token: string, profileName?: string): Promise<void> {
    token = token.trim();
    if (!token) {
      this.error('Token cannot be empty');
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

    if (profileName === SANDBOX_PROFILE) {
      this.error(`The "${SANDBOX_PROFILE}" profile is reserved. Use --profile <name>.`);
    }

    await saveProfile(profileName, { token });
    await setCurrentProfile(profileName);

    this.log(chalk.green(`\n  \u2713 Token saved to profile "${profileName}"\n`));
  }

  private async parseError(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      return body.message || body.error || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  }
}
