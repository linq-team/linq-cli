import { Args, Command, Flags } from '@oclif/core';
import { saveProfile, getCurrentProfile, type Profile } from '../../lib/config.js';

const VALID_KEYS: (keyof Profile)[] = ['token', 'ngrokAuthtoken', 'fromPhone'];

export default class ConfigSet extends Command {
  static override description = 'Set a configuration value';

  static override examples = [
    '<%= config.bin %> <%= command.id %> token YOUR_API_TOKEN',
    '<%= config.bin %> <%= command.id %> fromPhone +12025551234',
    '<%= config.bin %> <%= command.id %> ngrokAuthtoken YOUR_NGROK_AUTHTOKEN',
    '<%= config.bin %> <%= command.id %> token YOUR_TOKEN --profile work',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to set (token, ngrokAuthtoken, fromPhone)',
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

    if (!VALID_KEYS.includes(args.key as keyof Profile)) {
      this.error(
        `Invalid key: ${args.key}. Valid keys: ${VALID_KEYS.join(', ')}`
      );
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
