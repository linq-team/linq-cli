import { Command } from '@oclif/core';
import { listProfiles, getCurrentProfile } from '../../lib/config.js';

export default class ConfigList extends Command {
  static override description = 'List all configuration profiles';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    await this.parse(ConfigList);
    const profiles = await listProfiles();
    const current = await getCurrentProfile();

    this.log('Profiles:');
    for (const profile of profiles) {
      const marker = profile === current ? ' (active)' : '';
      this.log(`  ${profile}${marker}`);
    }
  }
}
