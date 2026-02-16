import { Args } from '@oclif/core';
import { confirm } from '@inquirer/prompts';
import { BaseCommand } from '../../lib/base-command.js';
import {
  deleteProfile,
  getCurrentProfile,
  SANDBOX_PROFILE,
} from '../../lib/config.js';

export default class ProfileDelete extends BaseCommand {
  static override description = 'Delete a named profile';

  static override examples = [
    '<%= config.bin %> <%= command.id %> work',
    '<%= config.bin %> <%= command.id %> staging',
  ];

  static override args = {
    name: Args.string({
      description: 'Profile name to delete',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ProfileDelete);

    if (args.name === SANDBOX_PROFILE) {
      const ok = await confirm({
        message: 'This will clear your sandbox credentials and metadata. Continue?',
      });
      if (!ok) return;
    }

    const current = await getCurrentProfile();
    await deleteProfile(args.name);

    if (args.name === current) {
      this.log(`Deleted profile "${args.name}" and switched to "default"`);
    } else {
      this.log(`Deleted profile "${args.name}"`);
    }
  }
}
