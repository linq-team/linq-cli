import { Args, Command } from '@oclif/core';
import { loadConfig } from '../../lib/config.js';

const VALID_KEYS = ['token'] as const;

export default class ConfigGet extends Command {
  static override description = 'Get a configuration value';

  static override examples = [
    '<%= config.bin %> <%= command.id %> token',
    '<%= config.bin %> <%= command.id %>',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to get (token)',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigGet);

    const config = await loadConfig();

    if (args.key) {
      if (!VALID_KEYS.includes(args.key as (typeof VALID_KEYS)[number])) {
        this.error(
          `Invalid key: ${args.key}. Valid keys: ${VALID_KEYS.join(', ')}`
        );
      }

      // Only handle string keys (token)
      if (args.key === 'token') {
        const value = config.token;
        if (value === undefined) {
          this.log(`${args.key} is not set`);
        } else {
          this.log(`${args.key}=${this.maskToken(value)}`);
        }
      }
    } else {
      if (!config.token) {
        this.log('No configuration set');
        return;
      }

      this.log(`token=${this.maskToken(config.token)}`);
    }
  }

  private maskToken(token: string): string {
    if (token.length <= 8) {
      return '****';
    }
    return token.slice(0, 4) + '****' + token.slice(-4);
  }
}
