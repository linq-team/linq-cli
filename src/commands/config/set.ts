import { Args, Command } from '@oclif/core';
import { loadConfig, saveConfig, type Config } from '../../lib/config.js';

const VALID_KEYS: (keyof Config)[] = ['token'];

export default class ConfigSet extends Command {
  static override description = 'Set a configuration value';

  static override examples = [
    '<%= config.bin %> <%= command.id %> token YOUR_API_TOKEN',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to set (token)',
      required: true,
    }),
    value: Args.string({
      description: 'Value to set',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigSet);

    if (!VALID_KEYS.includes(args.key as keyof Config)) {
      this.error(`Invalid key: ${args.key}. Valid keys: ${VALID_KEYS.join(', ')}`);
    }

    const config = await loadConfig();
    config.token = args.value;
    await saveConfig(config);

    this.log(`Set ${args.key} successfully`);
  }
}
