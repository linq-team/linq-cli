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
      description: 'Config profile to use',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    strict: Flags.boolean({
      description: 'Treat warnings as failures (exit non-zero on any warning)',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Doctor);

    type Check = { name: string; status: 'ok' | 'fail' | 'warn'; message: string };
    const checks: Check[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const ok = (name: string, message: string) => {
      checks.push({ name, status: 'ok', message });
      if (!flags.json) this.log(chalk.green('  ✓ ') + message);
      passed++;
    };
    const fail = (name: string, message: string) => {
      checks.push({ name, status: 'fail', message });
      if (!flags.json) this.log(chalk.red('  ✗ ') + message);
      failed++;
    };
    const warn = (name: string, message: string) => {
      checks.push({ name, status: 'warn', message });
      if (!flags.json) this.log(chalk.yellow('  ! ') + message);
      warnings++;
    };

    if (!flags.json) this.log('\n  Linq CLI Health Check\n');

    // Check 1: Config file
    const configFile = await loadConfigFile();
    const profileCount = Object.keys(configFile.profiles).length;
    if (profileCount > 0) {
      ok('config_file', 'Config file found');
    } else {
      fail('config_file', 'Config file not found — run `linq signup` or `linq login`');
    }

    // Load profile
    let config;
    try {
      config = await loadConfig(flags.profile);
    } catch {
      fail('profile_load', 'Failed to load config profile');
      this.emit(checks, passed, failed, warnings, flags.json, flags.strict);
      return;
    }

    if (config.token) {
      const masked = config.token.length > 12 ? `${config.token.slice(0, 12)}...` : config.token;
      ok('api_token', `API token configured (${masked})`);
    } else {
      fail('api_token', 'API token not configured — run `linq login` or `linq signup`');
    }

    if (config.fromPhone) {
      ok('linq_number', `Linq Number set (${config.fromPhone})`);
    } else {
      fail('linq_number', 'Linq Number not set — run `linq phonenumbers set` to pick a default');
    }

    const sessionExpiry = config.sessionExpiresAt || config.expiresAt;
    if (sessionExpiry) {
      const expires = new Date(sessionExpiry);
      if (expires > new Date()) {
        const daysLeft = Math.ceil((expires.getTime() - Date.now()) / 86_400_000);
        ok('session', `Session active (${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining)`);
      } else {
        fail('session', 'Session expired — run `linq login` to re-authenticate');
      }
    }

    if (config.token) {
      const client = createApiClient(config.token);
      const start = Date.now();
      try {
        const phones = await client.phoneNumbers.list();
        const latency = Date.now() - start;
        const phoneCount = (phones as { phone_numbers?: unknown[] }).phone_numbers?.length || 0;
        const phoneLabel = phoneCount > 0 ? `, ${phoneCount} phone${phoneCount !== 1 ? 's' : ''}` : '';
        ok('api_connectivity', `API connected (${latency}ms${phoneLabel})`);

        try {
          const webhooks = await client.webhookSubscriptions.list();
          const subs = (webhooks as { subscriptions?: { is_active: boolean }[] }).subscriptions || [];
          const active = subs.filter((s) => s.is_active).length;
          if (subs.length > 0) {
            ok('webhooks', `Webhooks: ${active} active, ${subs.length - active} inactive`);
          } else {
            warn('webhooks', 'No webhook subscriptions — run `linq webhooks create` or `linq webhooks listen`');
          }
        } catch {
          warn('webhooks', 'Could not check webhooks');
        }
      } catch (error) {
        const latency = Date.now() - start;
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          fail('api_connectivity', `API auth failed (${latency}ms) — token may be invalid or expired`);
        } else {
          fail('api_connectivity', `API unreachable (${latency}ms) — check your network`);
        }
      }
    } else {
      fail('api_connectivity', 'API connectivity — skipped (no token)');
    }

    this.emit(checks, passed, failed, warnings, flags.json, flags.strict);
  }

  private emit(
    checks: { name: string; status: 'ok' | 'fail' | 'warn'; message: string }[],
    passed: number,
    failed: number,
    warnings: number,
    json: boolean,
    strict: boolean,
  ): void {
    if (json) {
      this.log(JSON.stringify({
        ok: failed === 0 && (!strict || warnings === 0),
        passed,
        warnings,
        failed,
        checks,
      }, null, 2));
    } else {
      this.log('');
      const parts: string[] = [chalk.green(`${passed} passed`)];
      if (warnings > 0) parts.push(chalk.yellow(`${warnings} warning${warnings > 1 ? 's' : ''}`));
      if (failed > 0) parts.push(chalk.red(`${failed} failed`));
      this.log(`  ${parts.join(', ')}\n`);
    }
    if (failed > 0 || (strict && warnings > 0)) this.exit(1);
  }
}
