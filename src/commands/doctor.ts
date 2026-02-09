import { Command, Flags } from '@oclif/core';
import { loadConfig, loadConfigFile } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';

export default class Doctor extends Command {
  static override description = 'Check your Linq CLI configuration and connectivity';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Doctor);

    let passed = 0;
    let failed = 0;

    // Check 1: Config file exists
    const configFile = await loadConfigFile();
    const hasProfiles = Object.keys(configFile.profiles).length > 0;
    if (hasProfiles && configFile.profiles.default?.token) {
      this.log('\u2713 Config file exists at ~/.linq/config.json');
      passed++;
    } else if (hasProfiles) {
      this.log('\u2713 Config file exists at ~/.linq/config.json');
      passed++;
    } else {
      this.log('\u2717 Config file not found at ~/.linq/config.json');
      failed++;
    }

    // Load the profile config
    let config;
    try {
      config = await loadConfig(flags.profile);
    } catch {
      this.log('\u2717 Failed to load config profile');
      failed++;
      this.log(`\n${passed} check${passed !== 1 ? 's' : ''} passed, ${failed} issue${failed !== 1 ? 's' : ''} found`);
      return;
    }

    // Check 2: API token configured
    if (config.token) {
      const masked = config.token.slice(0, 4) + '****' + config.token.slice(-4);
      this.log(`\u2713 API token is configured (${masked})`);
      passed++;
    } else {
      this.log('\u2717 API token is not configured — run `linq login` or `linq init`');
      failed++;
    }

    // Check 3: Default phone number
    if (config.fromPhone) {
      this.log(`\u2713 Default phone number is set (${config.fromPhone})`);
      passed++;
    } else {
      this.log('\u2717 Default phone number is not set — run `linq config set fromPhone +1234567890`');
      failed++;
    }

    // Check 4: ngrok auth token
    if (config.ngrokAuthtoken) {
      const masked =
        config.ngrokAuthtoken.slice(0, 4) + '****' + config.ngrokAuthtoken.slice(-4);
      this.log(`\u2713 ngrok auth token is configured (${masked})`);
      passed++;
    } else {
      this.log('\u2717 ngrok auth token is not configured (optional, needed for `webhooks listen`)');
      failed++;
    }

    // Check 5: API connectivity
    if (config.token) {
      const client = createApiClient(config.token);
      const start = Date.now();
      try {
        const { error } = await client.GET('/v3/phonenumbers');
        const latency = Date.now() - start;
        if (error) {
          this.log(`\u2717 API request failed (${latency}ms) — check your token`);
          failed++;
        } else {
          this.log(`\u2713 API connection successful (${latency}ms)`);
          passed++;
        }
      } catch {
        const latency = Date.now() - start;
        this.log(`\u2717 API connection failed (${latency}ms) — check your network`);
        failed++;
      }
    } else {
      this.log('\u2717 API connectivity — skipped (no token)');
      failed++;
    }

    this.log(
      `\n${passed} check${passed !== 1 ? 's' : ''} passed, ${failed} issue${failed !== 1 ? 's' : ''} found`
    );
  }
}
