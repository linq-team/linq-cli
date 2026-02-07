import { Command, Flags } from '@oclif/core';
import { input } from '@inquirer/prompts';
import open from 'open';
import { loadConfig, saveConfig } from '../lib/config.js';
import { LOGO } from '../lib/banner.js';

// TODO: Create GitHub OAuth App and update this
const GITHUB_CLIENT_ID = 'Ov23liGRjTnm4bJgatLx';
const SANDBOX_API_URL =
  process.env.SANDBOX_API_URL || 'https://webhook.linqapp.com/sandbox';

const SIGNUP_BANNER = LOGO + '\n  Get a sandbox phone for testing\n';

export default class Signup extends Command {
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
    const config = await loadConfig();

    // Check for existing sandbox
    if (config.sandbox?.expiresAt) {
      const expires = new Date(config.sandbox.expiresAt);
      if (expires > new Date()) {
        this.log(`\nYou have an active sandbox: ${config.sandbox.phone}`);
        this.log(`Expires: ${expires.toLocaleTimeString()}\n`);
        return;
      }
    }

    console.log(SIGNUP_BANNER);

    // Step 1: GitHub OAuth
    this.log('Opening browser for GitHub authentication...\n');

    const githubToken = await this.githubAuth();
    if (!githubToken) {
      this.error('GitHub authentication failed or was cancelled.');
    }

    // Get GitHub user for display
    const ghUser = await this.getGitHubUser(githubToken);
    this.log(`✓ Authenticated as @${ghUser.login}\n`);

    // Step 2: Collect phone number
    let phone = flags.phone;
    if (!phone) {
      phone = await input({
        message: 'Your phone number (e.g. +1 205-441-1188):',
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
          return 'Enter a valid phone number with country code (e.g. +1 205-441-1188)';
        },
      });
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
      const err = (await res.json()) as { message?: string; error?: string };
      this.error(err.message || err.error || 'Signup failed');
    }

    const data = (await res.json()) as {
      token: string;
      sandboxPhone: string;
      userPhone: string;
      expiresAt: string;
      githubLogin: string;
    };

    // Save to config
    config.token = data.token;
    config.sandbox = {
      phone: data.sandboxPhone,
      userPhone: data.userPhone,
      expiresAt: data.expiresAt,
      githubLogin: data.githubLogin,
    };
    await saveConfig(config);

    this.log('✓ Sandbox ready!\n');
    this.log(`  Your sandbox number: ${data.sandboxPhone}`);
    this.log(
      `  Expires: ${new Date(data.expiresAt).toLocaleTimeString()}\n`
    );
    this.log('  Try: linq listen\n');
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
