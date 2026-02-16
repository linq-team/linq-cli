import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../lib/base-command.js';
import {
  listProfiles,
  saveProfile,
  SANDBOX_PROFILE,
} from '../../lib/config.js';

export default class ProfileCreate extends BaseCommand {
  static override description = 'Create a new named profile';

  static override examples = [
    '<%= config.bin %> <%= command.id %> work',
    '<%= config.bin %> <%= command.id %> staging --token YOUR_TOKEN --from-phone +12025551234',
  ];

  static override args = {
    name: Args.string({
      description: 'Profile name to create',
      required: true,
    }),
  };

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token',
    }),
    'from-phone': Flags.string({
      char: 'f',
      description: 'Default sender phone number',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ProfileCreate);

    if (args.name === SANDBOX_PROFILE) {
      this.error(`The "${SANDBOX_PROFILE}" profile is reserved for \`linq signup\``);
    }

    const profiles = await listProfiles();
    if (profiles.includes(args.name)) {
      this.error(
        `Profile "${args.name}" already exists. Use \`linq profile set\` to modify it.`
      );
    }

    await saveProfile(args.name, {
      ...(flags.token && { token: flags.token }),
      ...(flags['from-phone'] && { fromPhone: flags['from-phone'] }),
    });

    this.log(`Created profile "${args.name}"`);
  }
}
