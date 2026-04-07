import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import { loadConfig, loadConfigFile } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';

export default class Doctor extends BaseCommand {
  static override description = 'Check your Linq CLI configuration and connectivity';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use', hidden: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Doctor);

    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const ok = (msg: string) => { this.log(chalk.green('  ✓ ') + msg); passed++; };
    const fail = (msg: string) => { this.log(chalk.red('  ✗ ') + msg); failed++; };
    const warn = (msg: string) => { this.log(chalk.yellow('  ! ') + msg); warnings++; };

    this.log('\n  Linq CLI Health Check\n');

    // Check 1: Config file
    const configFile = await loadConfigFile();
    const profileCount = Object.keys(configFile.profiles).length;
    if (profileCount > 0) {
      ok('Config file found');
    } else {
      fail('Config file not found — run `linq signup` or `linq login`');
    }

    // Load profile
    let config;
    try {
      config = await loadConfig(flags.profile);
    } catch {
      fail('Failed to load config profile');
      this.printSummary(passed, failed, warnings);
      return;
    }

    // Check 2: API token
    if (config.token) {
      const masked = config.token.substring(0, 8) + '•'.repeat(8);
      ok(`API token configured (${masked})`);
    } else {
      fail('API token not configured — run `linq login` or `linq signup`');
    }

    // Check 3: Phone number
    if (config.fromPhone) {
      ok(`Phone number set (${config.fromPhone})`);
    } else {
      fail('Phone number not set — run `linq phonenumbers set` to pick a default');
    }

    // Check 4: Session expiry (for the active profile)
    const sessionExpiry = config.sessionExpiresAt || config.expiresAt;
    if (sessionExpiry) {
      const expires = new Date(sessionExpiry);
      if (expires > new Date()) {
        const daysLeft = Math.ceil((expires.getTime() - Date.now()) / 86_400_000);
        ok(`Session active (${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining)`);
      } else {
        fail(`Session expired — run \`linq login\` to re-authenticate`);
      }
    }

    // Check 5: API connectivity
    if (config.token) {
      const client = createApiClient(config.token);
      const start = Date.now();
      try {
        const phones = await client.phoneNumbers.list();
        const latency = Date.now() - start;
        const phoneCount = (phones as any).phone_numbers?.length || 0;
        const phoneLabel = phoneCount > 0 ? `, ${phoneCount} phone${phoneCount !== 1 ? 's' : ''}` : '';
        ok(`API connected (${latency}ms${phoneLabel})`);

        // Check 6: Webhooks
        try {
          const webhooks = await client.webhooks.subscriptions.list();
          const subs = (webhooks as any).subscriptions || [];
          const active = subs.filter((s: any) => s.is_active).length;
          if (subs.length > 0) {
            ok(`Webhooks: ${active} active, ${subs.length - active} inactive`);
          } else {
            warn('No webhook subscriptions — run `linq webhooks create` or `linq webhooks listen`');
          }
        } catch {
          warn('Could not check webhooks');
        }
      } catch (error) {
        const latency = Date.now() - start;
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          fail(`API auth failed (${latency}ms) — token may be invalid or expired`);
        } else {
          fail(`API unreachable (${latency}ms) — check your network`);
        }
      }
    } else {
      fail('API connectivity — skipped (no token)');
    }

    this.printSummary(passed, failed, warnings);
  }

  private printSummary(passed: number, failed: number, warnings: number): void {
    this.log('');
    const parts: string[] = [];
    parts.push(chalk.green(`${passed} passed`));
    if (warnings > 0) parts.push(chalk.yellow(`${warnings} warning${warnings > 1 ? 's' : ''}`));
    if (failed > 0) parts.push(chalk.red(`${failed} failed`));
    this.log(`  ${parts.join(', ')}\n`);
  }
}
