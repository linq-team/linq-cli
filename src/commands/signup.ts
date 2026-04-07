import { Flags, ux } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import {
  saveSandboxProfile,
  setCurrentProfile,
  getSandboxProfile,
  isSessionExpired,
  SANDBOX_PROFILE,
} from '../lib/config.js';
import { LOGO } from '../lib/banner.js';
import { BACKEND_URL } from '../lib/api-client.js';
import {
  addBreadcrumb,
  finishChildSpan,
  setTag,
  startChildSpan,
} from '../lib/telemetry.js';

const SESSION_DURATION_DAYS = 7;

const SIGNUP_BANNER = LOGO + '\n  Create your Linq developer account\n';

export default class Signup extends BaseCommand {
  static override description = 'Create a Linq developer account and get a phone number';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --email dev@example.com',
  ];

  static override flags = {
    email: Flags.string({
      char: 'e',
      description: 'Your email address',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Signup);
    let funnelStage = 'started';

    // Check for existing active session
    const existing = await getSandboxProfile();
    if (existing?.fromPhone && existing?.token && !isSessionExpired(existing)) {
      this.log(`\n  You already have an active account.`);
      this.log(`  Phone:   ${chalk.bold(existing.fromPhone)}\n`);
      return;
    }

    console.log(SIGNUP_BANNER);

    // Step 1: Collect email
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
    funnelStage = 'email_collected';
    addBreadcrumb('Email collected');

    // Step 2: Send OTP
    const otpSpan = startChildSpan('signup.otp', 'signup.stage');
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
        finishChildSpan(otpSpan, 'error');
        const err = await this.parseError(otpRes);
        this.log(chalk.red(`\n  ${err}\n`));
        this.exit(1);
      }

      const data = (await otpRes.json()) as { sessionId: string };
      sessionId = data.sessionId;
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      finishChildSpan(otpSpan, 'error');
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
      return;
    }
    ux.action.stop('sent!');
    this.log(`  Check ${chalk.bold(email)} for your verification code.\n`);

    // Step 3: Collect + verify OTP code
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
      finishChildSpan(otpSpan, 'error');
      if (error instanceof Error && error.name === 'ExitPromptError') {
        this.exit(1);
      }
      throw error;
    }

    ux.action.start('Verifying');

    let verifyResult: {
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

    try {
      const verifyRes = await fetch(`${BACKEND_URL}/cli/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: code.trim() }),
      });

      if (!verifyRes.ok) {
        ux.action.stop('failed');
        finishChildSpan(otpSpan, 'error');
        const err = await this.parseError(verifyRes);
        this.log(chalk.red(`\n  ${err}\n`));
        this.exit(1);
      }

      verifyResult = await verifyRes.json() as typeof verifyResult;
      ux.action.stop('done!');
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      finishChildSpan(otpSpan, 'error');
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
      return;
    }

    // Handle verify result
    if (verifyResult.status === 'existing') {
      // Existing Blue customer — welcome back, no name/phone needed
      funnelStage = 'existing_login';
      finishChildSpan(otpSpan, 'ok');

      const phones = verifyResult.accountInfo?.phones || [];
      const tier = verifyResult.accountInfo?.tier ?? 0;
      let phoneNumber = '';
      let accountLabel = '';

      if (phones.length === 1) {
        phoneNumber = phones[0].phoneNumber;
        if (tier === 0 && phones[0].tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
        else if (tier === 0 && phones[0].tenantType === 'MULTI') accountLabel = 'Shared Line';
        else if (tier >= 1) accountLabel = 'Paid';
      } else if (phones.length > 1) {
        accountLabel = tier >= 1 ? 'Paid' : 'Shared Line';
      }

      const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      await saveSandboxProfile({
        token: verifyResult.token,
        fromPhone: phoneNumber,
        orgId: verifyResult.orgId,
        email: verifyResult.email,
        name: verifyResult.name,
        tier,
        tenantType: phones.length === 1 ? phones[0].tenantType : undefined,
        sessionExpiresAt,
      });
      await setCurrentProfile(SANDBOX_PROFILE);

      this.log('');
      this.log(chalk.green('  \u2713 Welcome back!\n'));
      if (accountLabel) this.log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
      if (phones.length > 1) {
        this.log(`  ${chalk.dim('Phone:')}    ${chalk.yellow(`${phones.length} phones available`)}`);
        this.log(`             Run ${chalk.cyan('linq phonenumbers set')} to pick a default.`);
      } else {
        this.log(`  ${chalk.dim('Phone:')}    ${chalk.bold(phoneNumber || 'none')}`);
      }
      this.log(`  ${chalk.dim('Email:')}    ${verifyResult.email}`);
      this.log(`  ${chalk.dim('API Key:')}  ${verifyResult.token}`);
      this.log(`\n  You already have an account. Your existing API key and integrations are unchanged.`);
      this.log('');
      return;
    }

    // New user — ask for name and phone
    let name: string;
    try {
      name = await input({
        message: 'Your name:',
        validate: (v) => (v.trim() ? true : 'Name is required'),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ExitPromptError') {
        this.exit(1);
      }
      throw error;
    }
    name = name.trim();

    let phone: string | undefined;
    try {
      phone = await input({
        message: 'Phone number (optional, press enter to skip):',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ExitPromptError') {
        phone = '';
      } else {
        throw error;
      }
    }
    phone = phone?.trim() || undefined;
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) phone = `+1${digits}`;
      else if (digits.length === 11 && digits.startsWith('1')) phone = `+${digits}`;
      else if (digits.length >= 11) phone = `+${digits}`;
    }

    // Step 4: Provision new account
    ux.action.start('Creating your account');

    try {
      const provisionRes = await fetch(`${BACKEND_URL}/cli/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyResult.email, name, phone }),
      });

      if (!provisionRes.ok) {
        ux.action.stop('failed');
        finishChildSpan(otpSpan, 'error');
        const err = await this.parseError(provisionRes);

        if (err.includes('No shared lines')) {
          this.log(chalk.yellow('\n  All phone lines are currently full. Please try again later.\n'));
          this.exit(1);
        }

        this.log(chalk.red(`\n  ${err}\n`));
        this.exit(1);
      }

      const data = (await provisionRes.json()) as {
        token: string;
        orgId: string;
        email: string;
        name: string;
        accountInfo: {
          tier: number;
          phones: { phoneNumber: string; tenantType: string }[];
        } | null;
      };
      ux.action.stop('done!');
      funnelStage = 'account_created';
      finishChildSpan(otpSpan, 'ok');

      const phones = data.accountInfo?.phones || [];
      const tier = data.accountInfo?.tier ?? 0;
      let phoneNumber = '';
      let accountLabel = '';

      if (phones.length === 1) {
        phoneNumber = phones[0].phoneNumber;
        if (tier === 0 && phones[0].tenantType === 'SINGLE') accountLabel = 'Sandbox Line';
        else if (tier === 0 && phones[0].tenantType === 'MULTI') accountLabel = 'Shared Line';
        else if (tier >= 1) accountLabel = 'Paid';
      }

      addBreadcrumb('Account created', { phone: phoneNumber });

      const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      await saveSandboxProfile({
        token: data.token,
        fromPhone: phoneNumber,
        orgId: data.orgId,
        email: data.email,
        name: data.name,
        tier,
        tenantType: phones.length === 1 ? phones[0].tenantType : undefined,
        sessionExpiresAt,
      });
      await setCurrentProfile(SANDBOX_PROFILE);

      this.log('');
      this.log(chalk.green('  \u2713 Account created!\n'));
      if (accountLabel) this.log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
      this.log(`  ${chalk.dim('Phone:')}    ${chalk.bold(phoneNumber || 'pending')}`);
      this.log(`  ${chalk.dim('Email:')}    ${data.email}`);
      this.log(`  ${chalk.dim('API Key:')}  ${data.token}`);
      this.log('');
      if (phoneNumber && accountLabel === 'Shared Line') {
        this.log('  Your number is shared and allows a max of 100 contacts.');
        this.log('  Start by adding a contact. Your number is inbound-first:');
        this.log('  others text you first and then you can start the conversation.\n');
      }
      this.log('  Get started:\n');
      this.log(`    ${chalk.cyan('linq contacts add +1234567890')}  ${chalk.dim('# Add a contact')}`);
      this.log(`    ${chalk.cyan('linq webhooks listen')}            ${chalk.dim('# Watch for incoming events')}`);
      this.log('');
      this.log(`  ${chalk.dim('Full API docs:')} https://apidocs.linqapp.com`);
      this.log('');
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      finishChildSpan(otpSpan, 'error');
      this.log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      this.exit(1);
    }

    setTag('signup.funnel_stage', funnelStage);
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
