import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import {
  loadConfig,
  loadConfigFile,
  getCurrentProfile,
  type Profile,
} from '../../lib/config.js';

const VALID_KEYS: (keyof Profile)[] = ['token', 'fromPhone'];
const GLOBAL_KEYS = ['telemetry'] as const;

export default class ConfigGet extends BaseCommand {
  static override description = 'Get a configuration value';

  static override examples = [
    '<%= config.bin %> <%= command.id %> token',
    '<%= config.bin %> <%= command.id %> fromPhone',
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --profile work',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to get (token, fromPhone, telemetry)',
      required: false,
    }),
  };

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to read from',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigGet);

    const currentProfile = await getCurrentProfile();
    const profileName = flags.profile || currentProfile;
    const config = await loadConfig(profileName);

    if (args.key) {
      const allKeys = [...VALID_KEYS, ...GLOBAL_KEYS];
      if (!allKeys.includes(args.key as (typeof allKeys)[number])) {
        this.error(
          `Invalid key: ${args.key}. Valid keys: ${allKeys.join(', ')}`
        );
      }

      // Handle global (non-profile) keys
      if (GLOBAL_KEYS.includes(args.key as (typeof GLOBAL_KEYS)[number])) {
        const configFile = await loadConfigFile();
        const value = configFile[args.key as keyof typeof configFile];
        if (value === undefined) {
          this.log(`${args.key} is not set`);
        } else {
          this.log(`${args.key}=${value}`);
        }
        return;
      }

      const value = config[args.key as keyof Profile];
      if (value === undefined) {
        this.log(`${args.key} is not set`);
      } else if (typeof value === 'string') {
        this.log(`${args.key}=${this.maskToken(value)}`);
      } else {
        this.log(`${args.key}=${JSON.stringify(value)}`);
      }
    } else {
      this.log(`Profile: ${profileName}`);

      if (!config.token && !config.fromPhone) {
        this.log('No configuration set');
        return;
      }

      if (config.token) {
        this.log(`token=${this.maskToken(config.token)}`);
      }
      if (config.fromPhone) {
        this.log(`fromPhone=${config.fromPhone}`);
      }
    }
  }

  private maskToken(token: string): string {
    if (token.length <= 8) {
      return '****';
    }
    return token.slice(0, 4) + '****' + token.slice(-4);
  }
}
