import { ux } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import {
  saveProfile,
  setCurrentProfile,
  loadConfig,
  isSessionExpired,
  getDisplayTier,
  getLineType,
} from './config.js';
import { BACKEND_URL } from './api-client.js';
import { addBreadcrumb } from './telemetry.js';
import { copyToClipboard } from './clipboard.js';

const SESSION_DURATION_DAYS = 7;

interface AuthFlowOptions {
  email: string;
  // When `code` and `name` are provided we skip the interactive prompts
  // so `linq signup` is fully scriptable / AI-agent driven.
  code?: string;
  name?: string;
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

export async function runAuthFlow(opts: AuthFlowOptions): Promise<void> {
  const { email, code: codeFlag, name: nameFlag, log, exit, parseError } = opts;

  // Step 1: Send OTP.
  // Skipped entirely when `--code` was passed — the caller already has a
  // code from a prior `linq signup --email <e>` invocation. Re-sending
  // here would mint a new OTP and invalidate the one the user is about
  // to verify with.
  let sessionId: string | undefined;
  if (!codeFlag) {
    ux.action.start('Sending verification code');
    try {
      const otpRes = await fetch(`${BACKEND_URL}/cli/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!otpRes.ok) {
        ux.action.stop('failed');
        const err = await parseError(otpRes);
        log(chalk.yellow(`\n  ${err}\n`));
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

    // Non-TTY (AI agent, CI, piped stdin) can't drive the interactive
    // OTP prompt. Bail cleanly with the exact next command so the caller
    // can re-run with --code (and --name) once the user supplies them.
    // Skip the bail in test contexts where inquirer prompts are mocked.
    if (!process.stdin.isTTY && !process.env.VITEST) {
      log(`  To complete signup, run:`);
      log(`    ${chalk.cyan(`linq signup --email ${email} --code <6-digit-code> --name "<your name>"`)}\n`);
      exit(0);
    }
  }

  // Step 2: Verify OTP. Reprompt on a bad code instead of exiting.
  type VerifyResult = {
    needsSignup: boolean;
    signupToken?: string;
    token?: string;
    orgId?: string;
    partnerId?: string | null;
    email: string;
    name?: string;
    accountInfo?: {
      phones: { phoneNumber: string }[];
      accountLabel?: 'Shared' | 'Sandbox' | 'Paid';
    } | null;
  };

  let verifyResult: VerifyResult | undefined;
  while (!verifyResult) {
    let code: string;
    if (codeFlag) {
      code = codeFlag;
    } else {
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
    }

    ux.action.start('Verifying');
    try {
      // sessionId path when send-otp ran in this process; email path
      // when --code was supplied (multi-process / non-interactive flow).
      const verifyBody = sessionId
        ? { sessionId, code: code.trim() }
        : { email, code: code.trim() };
      const verifyRes = await fetch(`${BACKEND_URL}/cli/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyBody),
      });

      if (!verifyRes.ok) {
        ux.action.stop('failed');
        const err = await parseError(verifyRes);
        if (verifyRes.status === 400 || verifyRes.status === 401) {
          // Don't loop in non-interactive mode — there's no one to
          // re-prompt. Bail out so the caller sees the error and can
          // run signup with a fresh --code.
          if (codeFlag) {
            log(chalk.red(`\n  ${err}\n`));
            exit(1);
          }
          log(chalk.yellow(`\n  ${err}\n`));
          continue;
        }
        log(chalk.red(`\n  ${err}\n`));
        exit(1);
      }

      verifyResult = (await verifyRes.json()) as VerifyResult;
      ux.action.stop('done!');
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      exit(1);
      return;
    }
  }

  // If the email already has an account, bounce them to `linq login`.
  // Signup is for brand-new users only.
  if (!verifyResult.needsSignup) {
    log('');
    log(chalk.yellow(`  You already have a Linq account for ${chalk.bold(email)}.`));
    log('');
    log(`  Use ${chalk.cyan('linq login --token <your-token>')} to sign in.`);
    log(`  If you've lost your token, generate a new one at ${chalk.cyan('https://dashboard.linqapp.com/api-tooling/')}`);
    log('');
    exit(0);
  }

  // Step 3: New user — ask for name and finalize via /cli/signup
  let isNewUser = false;
  if (verifyResult.needsSignup) {
    isNewUser = true;
    let name: string;
    if (nameFlag) {
      name = nameFlag;
    } else {
      try {
        const entered = await input({
          message: 'Your name:',
          validate: (v) => (v.trim() ? true : 'Name is required'),
        });
        name = entered.trim();
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          exit(1);
        }
        throw error;
      }
    }

    ux.action.start('Creating your account');
    try {
      const signupRes = await fetch(`${BACKEND_URL}/cli/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupToken: verifyResult.signupToken, name }),
      });

      if (!signupRes.ok) {
        ux.action.stop('failed');
        const err = await parseError(signupRes);
        if (err.includes('No shared lines')) {
          log(chalk.yellow('\n  All phone lines are currently full. Please try again later.\n'));
          exit(1);
        }
        log(chalk.red(`\n  ${err}\n`));
        exit(1);
      }

      const data = (await signupRes.json()) as {
        token: string;
        orgId: string;
        partnerId: string | null;
        email: string;
        name: string;
        accountInfo: VerifyResult['accountInfo'];
      };
      ux.action.stop('done!');
      verifyResult = { needsSignup: false, ...data };
    } catch (error) {
      if (error instanceof Error && 'oclif' in error) throw error;
      ux.action.stop('failed');
      log(chalk.red('\n  Could not connect to Linq. Please try again later.\n'));
      exit(1);
      return;
    }
  }

  const phones = verifyResult.accountInfo?.phones || [];
  const phoneNumber = phones.length >= 1 ? phones[0].phoneNumber : '';
  const accountLabel = verifyResult.accountInfo?.accountLabel;

  const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await saveProfile('default', {
    token: verifyResult.token,
    fromPhone: phoneNumber,
    ...(verifyResult.partnerId && { partnerId: verifyResult.partnerId }),
    orgId: verifyResult.orgId,
    email: verifyResult.email,
    name: verifyResult.name,
    accountLabel,
    sessionExpiresAt,
  });
  await setCurrentProfile('default');

  if (isNewUser) {
    addBreadcrumb('Account created', { phone: phoneNumber });
    log('');
    log(chalk.green('  ✓ Account created!\n'));
    const tier = getDisplayTier(accountLabel);
    const line = getLineType(accountLabel);
    if (tier) log(`  ${chalk.dim('Tier:')}         ${tier}`);
    if (line) log(`  ${chalk.dim('Line:')}         ${line}`);
    log(`  ${chalk.dim('Linq Number:')}  ${chalk.bold(phoneNumber || 'pending')}`);
    log(`  ${chalk.dim('Email:')}        ${verifyResult.email}`);
    log(`  ${chalk.dim('API Key:')}      ${chalk.bold(verifyResult.token)}`);
    log('');

    // Auto-copy on real terminals only — keeps AI-agent / CI logs clean
    // and avoids spawning pbcopy/xclip in headless contexts.
    const copied = process.stdout.isTTY && verifyResult.token
      ? await copyToClipboard(verifyResult.token)
      : false;

    if (copied) {
      log(chalk.green('  ✓ Copied to clipboard — save it somewhere secure. It will not be shown again.'));
    } else {
      log(chalk.yellow('  ⚠  Save this token securely — it will not be shown again.'));
    }
    log('');
    if (line === 'Shared') {
      log('  Your Shared line allows up to 20 contacts.');
      log(`  Start by adding one with ${chalk.cyan('linq contacts add +1...')}.`);
      log('  They must text your Linq Number first, then you can reply.\n');
    } else if (tier === 'Free') {
      log('  Your Free line is inbound-first.');
      log('  Anyone can text your Linq Number first, then you can reply.\n');
    }
    log('  Get started:\n');
    log(`    ${chalk.cyan('linq contacts add +1234567890')}                            ${chalk.dim('# Add a contact')}`);
    log(`    ${chalk.cyan('linq webhooks listen')}                                     ${chalk.dim('# Watch for incoming events')}`);
    log(`    ${chalk.cyan('linq chats create --to +1234567890 -m "Hi from CLI"')}      ${chalk.dim('# Send a message')}`);
    log('');
    log(`  ${chalk.dim('Full API docs:')} https://apidocs.linqapp.com`);
    log('');
  } else {
    addBreadcrumb('Login successful', { accountType: accountLabel || 'unknown' });
    log('');
    log(chalk.green('  ✓ Welcome back!\n'));
    const tier = getDisplayTier(accountLabel);
    const line = getLineType(accountLabel);
    if (tier) log(`  ${chalk.dim('Tier:')}         ${tier}`);
    if (line) log(`  ${chalk.dim('Line:')}         ${line}`);
    if (phones.length > 1) {
      log(`  ${chalk.dim('Linq Number:')}  ${chalk.yellow(`${phones.length} Linq Numbers available`)}`);
      log(`                 Run ${chalk.cyan('linq phonenumbers set')} to pick a default.`);
    } else {
      log(`  ${chalk.dim('Linq Number:')}  ${chalk.bold(phoneNumber || 'none')}`);
    }
    log(`  ${chalk.dim('Email:')}        ${verifyResult.email}`);
    log(`  ${chalk.dim('API Key:')}      ${verifyResult.token}`);
    if (line === 'Shared') {
      log('');
      log(`  Shared line: add contacts with ${chalk.cyan('linq contacts add +1...')}, have them text you first, then reply.`);
    } else if (tier === 'Free') {
      log('');
      log('  Free line is inbound-first: have someone text your Linq Number first, then reply.');
    }
    log('');
  }
}
