import { Args } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import { setCurrentProfile, listProfiles } from '../../lib/config.js';

export default class ConfigUse extends BaseCommand {
  static override description = 'Switch to a different configuration profile';

  static override examples = [
    '<%= config.bin %> <%= command.id %> work',
    '<%= config.bin %> <%= command.id %> default',
  ];

  static override args = {
    profile: Args.string({
      description: 'Profile name to switch to',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigUse);

    const profiles = await listProfiles();

    if (!profiles.includes(args.profile)) {
      this.error(
        `Profile "${args.profile}" not found. Available profiles: ${profiles.join(', ')}\n` +
          `Create it with: linq config set token YOUR_TOKEN --profile ${args.profile}`
      );
    }

    await setCurrentProfile(args.profile);
    this.log(`Switched to profile "${args.profile}"`);
  }
}
