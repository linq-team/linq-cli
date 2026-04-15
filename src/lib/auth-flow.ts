import { ux } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import {
  saveProfile,
  setCurrentProfile,
  loadConfig,
  isSessionExpired,
} from './config.js';
import { BACKEND_URL } from './api-client.js';
import { addBreadcrumb } from './telemetry.js';

const SESSION_DURATION_DAYS = 7;

interface AuthFlowOptions {
  email: string;
  log: (msg: string) => void;
  exit: (code: number) => never;
  parseError: (res: Response) => Promise<string>;
}

/**
 * Check if there's an active session. Returns identity string if logged in, null if not.
 */
export async function checkExistingSession(): Promise<string | null> {
  try {
    const current = await loadConfig();
    if (current.token && !isSessionExpired(current)) {
      return current.email || current.fromPhone || 'another account';
    }
  } catch {
    // No config
  }
  return null;
}

/**
 * Shared auth flow for both signup and login.
 * 1. Send OTP
 * 2. Verify code
 * 3. If existing → save profile, show account
 * 4. If new → ask name, provision, show account
 */
export async function runAuthFlow(opts: AuthFlowOptions): Promise<void> {
  const { email, log, exit, parseError } = opts;

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
      const err = await parseError(otpRes);
      log(chalk.red(`\n  ${err}\n`));
      exit(1);
    }

    const data = (await otpRes.json()) as { sessionId: string };
    sessionId = data.sessionId;
  } catch (error) {
    if (error instanceof Error && 'oclif' in error) throw error;
    ux.action.stop('failed');
    log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
    exit(1);
    return;
  }
  ux.action.stop('sent!');
  log(`  Check ${chalk.bold(email)} for your verification code.\n`);

  // Step 2: Verify OTP
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
      exit(1);
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
      const err = await parseError(verifyRes);
      log(chalk.red(`\n  ${err}\n`));
      exit(1);
    }

    verifyResult = await verifyRes.json() as typeof verifyResult;
    ux.action.stop('done!');
  } catch (error) {
    if (error instanceof Error && 'oclif' in error) throw error;
    ux.action.stop('failed');
    log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
    exit(1);
    return;
  }

  // Existing user → save and show
  if (verifyResult.status === 'existing') {
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
    await saveProfile('default', {
      token: verifyResult.token,
      fromPhone: phoneNumber,
      orgId: verifyResult.orgId,
      email: verifyResult.email,
      name: verifyResult.name,
      tier,
      tenantType: phones.length === 1 ? phones[0].tenantType : undefined,
      sessionExpiresAt,
    });
    await setCurrentProfile('default');

    addBreadcrumb('Login successful', { accountType: accountLabel || 'unknown' });
    log('');
    log(chalk.green('  \u2713 Welcome back!\n'));
    if (accountLabel) log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
    if (phones.length > 1) {
      log(`  ${chalk.dim('Phone:')}    ${chalk.yellow(`${phones.length} phones available`)}`);
      log(`             Run ${chalk.cyan('linq phonenumbers set')} to pick a default.`);
    } else {
      log(`  ${chalk.dim('Phone:')}    ${chalk.bold(phoneNumber || 'none')}`);
    }
    log(`  ${chalk.dim('Email:')}    ${verifyResult.email}`);
    log(`  ${chalk.dim('API Key:')}  ${verifyResult.token}`);
    log('');
    return;
  }

  // New user → ask name, provision
  let name: string;
  try {
    name = await input({
      message: 'Your name:',
      validate: (v) => (v.trim() ? true : 'Name is required'),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      exit(1);
    }
    throw error;
  }
  name = name.trim();

  ux.action.start('Creating your account');

  try {
    const provisionRes = await fetch(`${BACKEND_URL}/cli/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verifyResult.email, name }),
    });

    if (!provisionRes.ok) {
      ux.action.stop('failed');
      const err = await parseError(provisionRes);

      if (err.includes('No shared lines')) {
        log(chalk.yellow('\n  All phone lines are currently full. Please try again later.\n'));
        exit(1);
      }

      log(chalk.red(`\n  ${err}\n`));
      exit(1);
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
    await saveProfile('default', {
      token: data.token,
      fromPhone: phoneNumber,
      orgId: data.orgId,
      email: data.email,
      name: data.name,
      tier,
      tenantType: phones.length === 1 ? phones[0].tenantType : undefined,
      sessionExpiresAt,
    });
    await setCurrentProfile('default');

    log('');
    log(chalk.green('  \u2713 Account created!\n'));
    if (accountLabel) log(`  ${chalk.dim('Account:')}  ${accountLabel}`);
    log(`  ${chalk.dim('Phone:')}    ${chalk.bold(phoneNumber || 'pending')}`);
    log(`  ${chalk.dim('Email:')}    ${data.email}`);
    log(`  ${chalk.dim('API Key:')}  ${data.token}`);
    log('');
    if (phoneNumber && accountLabel === 'Shared Line') {
      log('  Your number is shared and allows a max of 100 contacts.');
      log('  Start by adding a contact. Your number is inbound-first:');
      log('  others text you first and then you can start the conversation.\n');
    }
    log('  Get started:\n');
    log(`    ${chalk.cyan('linq contacts add +1234567890')}  ${chalk.dim('# Add a contact')}`);
    log(`    ${chalk.cyan('linq webhooks listen')}            ${chalk.dim('# Watch for incoming events')}`);
    log('');
    log(`  ${chalk.dim('Full API docs:')} https://apidocs.linqapp.com`);
    log('');
  } catch (error) {
    if (error instanceof Error && 'oclif' in error) throw error;
    ux.action.stop('failed');
    log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
    exit(1);
  }
}
