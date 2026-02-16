import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import {
  listProfiles,
  getCurrentProfile,
  loadConfigFile,
  SANDBOX_PROFILE,
} from '../../lib/config.js';

export default class ProfileList extends BaseCommand {
  static override description = 'List all configuration profiles';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    await this.parse(ProfileList);
    const profiles = await listProfiles();
    const current = await getCurrentProfile();
    const configFile = await loadConfigFile();

    this.log('Profiles:');
    for (const profile of profiles) {
      const markers: string[] = [];
      if (profile === current) markers.push('active');

      const profileData = configFile.profiles[profile];

      if (profile === SANDBOX_PROFILE) {
        if (profileData?.fromPhone && profileData?.expiresAt) {
          const expires = new Date(profileData.expiresAt);
          if (expires > new Date()) {
            markers.push(`${profileData.fromPhone}, expires ${expires.toLocaleTimeString()}`);
          } else {
            markers.push('expired');
          }
        }
      } else if (profileData?.fromPhone) {
        markers.push(profileData.fromPhone);
      }

      const suffix = markers.length > 0 ? ` (${markers.join(', ')})` : '';
      const label = profile === current ? chalk.bold(`${profile}${suffix}`) : `${profile}${suffix}`;
      this.log(`  ${label}`);
    }
  }
}
