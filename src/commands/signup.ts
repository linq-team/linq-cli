import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Flags, ux } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import open from 'open';
import { BaseCommand } from '../lib/base-command.js';
import {
  getSandboxProfile,
  isSandboxExpired,
  saveSandboxProfile,
  setCurrentProfile,
  SANDBOX_PROFILE,
} from '../lib/config.js';
import { fetchPartnerId } from '../lib/partner.js';
import { createApiClient } from '../lib/api-client.js';
import { formatLogLine } from '../lib/webhook-format.js';
import { LOGO } from '../lib/banner.js';
import type { components } from '../gen/api-types.js';

type WebhookEventType = components['schemas']['WebhookEventType'];

const GITHUB_CLIENT_ID = 'Ov23lifn0bcZx3W7pmqr';
const WEBHOOK_BASE_URL =
  process.env.WEBHOOK_BASE_URL || 'https://webhook.linqapp.com';
const SANDBOX_API_URL =
  process.env.SANDBOX_API_URL || `${WEBHOOK_BASE_URL}/sandbox`;
const WS_URL = process.env.LINQ_RELAY_WS_URL || 'wss://9r8ugjg4s0.execute-api.us-east-1.amazonaws.com/prod';
const RELAY_URL = process.env.LINQ_RELAY_URL || 'https://webhook.linqapp.com';

const SIGNUP_BANNER = LOGO + '\n  Get a sandbox phone for testing\n';

export default class Signup extends BaseCommand {
  static override description = 'Get a sandbox phone number for testing';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --phone +15551234567',
  ];

  static override flags = {
    phone: Flags.string({
      char: 'p',
      description: 'Your phone number',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Signup);

    // Check for existing sandbox
    const existing = await getSandboxProfile();
    if (existing && !isSandboxExpired(existing)) {
      const expires = new Date(existing.expiresAt!);
      this.log(`\nYou have an active sandbox: ${existing.fromPhone}`);
      this.log(`Expires: ${expires.toLocaleTimeString()}\n`);
      return;
    }

    console.log(SIGNUP_BANNER);

    // Step 1: GitHub OAuth (check cache first)
    let githubToken: string;
    const cached = await this.getCachedGitHubToken();
    if (cached) {
      // Validate the cached token
      try {
        const user = await this.getGitHubUser(cached.token);
        if (user.login) {
          githubToken = cached.token;
          this.log(`Resuming as @${user.login}\n`);
        } else {
          throw new Error('invalid');
        }
      } catch {
        await this.clearGitHubCache();
        githubToken = await this.doGitHubAuth();
      }
    } else {
      githubToken = await this.doGitHubAuth();
    }

    // Step 2: Collect phone number
    let phone = flags.phone;
    if (!phone) {
      try {
        phone = await input({
          message: 'Your phone number (e.g. +11234567890):',
          validate: (v) => {
            const digits = v.replace(/\D/g, '');
            if (digits.length === 10) {
              return true; // US number without country code
            }
            if (digits.length === 11 && digits.startsWith('1')) {
              return true; // US number with country code
            }
            if (digits.length >= 11 && digits.length <= 15) {
              return true; // International number
            }
            return 'Enter a valid phone number with country code (e.g. +12025550199)';
          },
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          this.log(chalk.yellow('\nNon-interactive terminal detected. Use --phone to provide your number.\n'));
          this.log(`  Example: ${chalk.cyan('linq signup --phone +11234567890')}\n`);
          this.exit(1);
        }
        throw error;
      }
    }
    phone = this.normalizePhone(phone);

    // Step 3: Create sandbox
    this.log('\nSetting up your sandbox...\n');

    const res = await fetch(`${SANDBOX_API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubToken, phone }),
    });

    if (!res.ok) {
      let message = 'Signup failed';
      try {
        const err = (await res.json()) as { message?: string; error?: string };
        message = err.message || err.error || message;
      } catch {
        // non-JSON response
      }

      if (message.toLowerCase().includes('no sandbox phones')) {
        message =
          'All sandbox phones are currently in use. Please try again in 30 minutes.';
      }

      this.log(chalk.red(`\n  ${message}\n`));
      this.exit(1);
    }

    const data = (await res.json()) as {
      token: string;
      partnerId?: string;
      sandboxPhone: string;
      userPhone: string;
      expiresAt: string;
      githubLogin: string;
    };

    // Save to sandbox profile
    const partnerId = data.partnerId ?? await fetchPartnerId(data.token) ?? undefined;
    await saveSandboxProfile({
      token: data.token,
      fromPhone: data.sandboxPhone,
      partnerId,
      expiresAt: data.expiresAt,
      githubLogin: data.githubLogin,
    });
    await setCurrentProfile(SANDBOX_PROFILE);

    // Wait for mac-agent to reconcile
    ux.action.start('Preparing your sandbox phone');
    await this.sleep(10000);
    ux.action.stop('ready!');

    this.log(`\n  Your sandbox number: ${chalk.bold(data.sandboxPhone)}\n`);
    this.log(`  Send a text from your phone to ${chalk.bold(data.sandboxPhone)} to activate it.\n`);

    // Set up an ephemeral webhook to detect the first inbound message
    const client = createApiClient(data.token);
    const firstEvent = await this.waitForFirstMessage(client, data.token);

    if (firstEvent) {
      this.log('');
      this.log(formatLogLine(firstEvent));
      this.log('');
    }

    // Send welcome message (requires inbound message first)
    try {
      await client.POST('/v3/chats', {
        body: {
          from: data.sandboxPhone,
          to: [data.userPhone],
          message: {
            parts: [
              {
                type: 'text',
                value: `Hey! 👋 Your Linq sandbox is live! This number is yours for the next 3 hours. Happy hacking!`,
              },
            ],
            effect: { type: 'screen', name: 'confetti' },
          },
        },
      });
    } catch {
      // Non-fatal
    }

    this.log(chalk.green('✓ Sandbox activated!\n'));
    this.log(`  Phone:   ${data.sandboxPhone}`);
    this.log(`  Expires: ${new Date(data.expiresAt).toLocaleTimeString()}\n`);
    this.log('  Get started:\n');
    this.log(`    ${chalk.cyan('linq webhooks listen')}`);
    this.log(`    ${chalk.cyan(`linq chats create --to ${data.userPhone} -m "Hello from Linq CLI!"`)}\n`);
  }

  private async doGitHubAuth(): Promise<string> {
    this.log('Opening browser for GitHub authentication...\n');

    const githubToken = await this.githubAuth();
    if (!githubToken) {
      this.log(chalk.red('\n  GitHub authentication failed or was cancelled.\n'));
      this.exit(1);
    }

    const ghUser = await this.getGitHubUser(githubToken);
    this.log(`✓ Authenticated as @${ghUser.login}\n`);

    await this.cacheGitHubToken(githubToken, ghUser.login);

    return githubToken;
  }

  private async githubAuth(): Promise<string | null> {
    // Request device code
    const codeRes = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: 'read:user user:email',
      }),
    });

    if (!codeRes.ok) {
      return null;
    }

    const codeData = (await codeRes.json()) as {
      device_code: string;
      user_code: string;
      verification_uri: string;
      interval?: number;
    };
    const { device_code, user_code, verification_uri, interval } = codeData;

    this.log(`Your code: ${user_code}\n`);

    await open(verification_uri);

    // Poll for token
    const timeout = 15 * 60 * 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      await this.sleep((interval || 5) * 1000);

      const tokenRes = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        }
      );

      const tokenData = (await tokenRes.json()) as {
        access_token?: string;
        error?: string;
      };

      if (tokenData.access_token) {
        return tokenData.access_token;
      }

      if (tokenData.error === 'authorization_pending') {
        continue;
      }

      if (tokenData.error === 'slow_down') {
        await this.sleep(5000);
        continue;
      }

      if (
        tokenData.error === 'expired_token' ||
        tokenData.error === 'access_denied'
      ) {
        return null;
      }
    }

    return null;
  }

  private async getGitHubUser(
    token: string
  ): Promise<{ login: string; id: number }> {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<{ login: string; id: number }>;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
  }

  private async waitForFirstMessage(
    client: ReturnType<typeof createApiClient>,
    token: string,
  ): Promise<Record<string, unknown> | null> {
    let ws: WebSocket | null = null;
    let webhookId: string | null = null;

    try {
      // Connect to WebSocket relay
      const connectionId = await new Promise<string>((resolve, reject) => {
        const url = `${WS_URL}?token=${encodeURIComponent(token)}`;
        ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          ws?.close();
          reject(new Error('WebSocket connection timed out'));
        }, 10_000);

        ws.addEventListener('open', () => {
          ws!.send(JSON.stringify({ action: 'init' }));
        });

        ws.addEventListener('message', (event) => {
          try {
            const msg = JSON.parse(typeof event.data === 'string' ? event.data : '');
            if (msg.connectionId) {
              clearTimeout(timeout);
              resolve(msg.connectionId);
            }
          } catch { /* ignore malformed */ }
        });

        ws.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Failed to connect to relay'));
        });
      });

      // Create ephemeral webhook subscription
      const { data: whData } = await client.POST('/v3/webhook-subscriptions', {
        body: {
          target_url: `${RELAY_URL}/relay/${connectionId}`,
          subscribed_events: ['message.received'] as WebhookEventType[],
        },
      });
      webhookId = whData?.id ?? null;

      // Wait for the first message.received event (up to 3 minutes)
      ux.action.start('Waiting for your text message');
      const event = await new Promise<Record<string, unknown> | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 3 * 60 * 1000);

        ws!.addEventListener('message', (msg) => {
          try {
            const payload = JSON.parse(typeof msg.data === 'string' ? msg.data : '') as Record<string, unknown>;
            if (payload.event_type === 'message.received') {
              clearTimeout(timeout);
              resolve(payload);
            }
          } catch { /* ignore */ }
        });

        ws!.addEventListener('close', () => {
          clearTimeout(timeout);
          resolve(null);
        });
      });
      ux.action.stop(event ? 'received!' : 'timed out');

      return event;
    } catch {
      ux.action.stop('skipped');
      return null;
    } finally {
      // Clean up: close WebSocket and delete webhook
      if (ws && (ws as WebSocket).readyState !== WebSocket.CLOSED) {
        (ws as WebSocket).close();
      }
      if (webhookId) {
        try {
          await client.DELETE('/v3/webhook-subscriptions/{subscriptionId}', {
            params: { path: { subscriptionId: webhookId } },
          });
        } catch { /* ignore cleanup errors */ }
      }
    }
  }

  private getGitHubCachePath(): string {
    return join(process.env.HOME || homedir(), '.linq', '.github-cache.json');
  }

  private async cacheGitHubToken(token: string, login: string): Promise<void> {
    const path = this.getGitHubCachePath();
    await mkdir(join(path, '..'), { recursive: true, mode: 0o700 });
    await writeFile(path, JSON.stringify({ token, login }), { mode: 0o600 });
  }

  private async getCachedGitHubToken(): Promise<{ token: string; login: string } | null> {
    try {
      const data = await readFile(this.getGitHubCachePath(), 'utf-8');
      const parsed = JSON.parse(data) as { token?: string; login?: string };
      if (parsed.token && parsed.login) {
        return { token: parsed.token, login: parsed.login };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async clearGitHubCache(): Promise<void> {
    try {
      await unlink(this.getGitHubCachePath());
    } catch {
      // ignore if file doesn't exist
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
