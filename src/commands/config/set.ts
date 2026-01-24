import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import {
  saveProfile,
  getCurrentProfile,
  loadConfigFile,
  saveConfigFile,
  type Profile,
} from '../../lib/config.js';

const VALID_KEYS: (keyof Profile)[] = ['token', 'fromPhone'];
const GLOBAL_KEYS = ['telemetry'] as const;

export default class ConfigSet extends BaseCommand {
  static override description = 'Set a configuration value';

  static override examples = [
    '<%= config.bin %> <%= command.id %> token YOUR_API_TOKEN',
    '<%= config.bin %> <%= command.id %> fromPhone +12025551234',
    '<%= config.bin %> <%= command.id %> token YOUR_TOKEN --profile work',
    '<%= config.bin %> <%= command.id %> telemetry false',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to set (token, fromPhone, telemetry)',
      required: true,
    }),
    value: Args.string({
      description: 'Value to set',
      required: true,
    }),
  };

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Profile to save to (creates if needed)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigSet);

    const allKeys = [...VALID_KEYS, ...GLOBAL_KEYS];
    if (!allKeys.includes(args.key as (typeof allKeys)[number])) {
      this.error(
        `Invalid key: ${args.key}. Valid keys: ${allKeys.join(', ')}`
      );
    }

    // Handle global (non-profile) keys
    if (GLOBAL_KEYS.includes(args.key as (typeof GLOBAL_KEYS)[number])) {
      const configFile = await loadConfigFile();
      if (args.key === 'telemetry') {
        configFile.telemetry = args.value === 'true';
      }
      await saveConfigFile(configFile);
      this.log(`Set ${args.key} to ${args.value} successfully`);
      return;
    }

    const currentProfile = await getCurrentProfile();
    const profileName = flags.profile || currentProfile;

    const profile: Profile = {
      [args.key]: args.value,
    };

    await saveProfile(profileName, profile);

    this.log(`Set ${args.key} in profile "${profileName}" successfully`);
  }
}
