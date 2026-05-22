import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import { TokenSummary } from '../../lib/tokens-helpers.js';
import { bail, throwHttpError } from '../../lib/errors.js';

export default class TokensRename extends BaseCommand {
  static override description = 'Rename an API token';

  static override examples = [
    '<%= config.bin %> <%= command.id %> <id> --name "New Name"',
  ];

  static override args = {
    id: Args.string({ description: 'Token ID to rename', required: true }),
  };

  static override flags = {
    name: Flags.string({ char: 'n', description: 'New token name', required: true }),
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TokensRename);
    const config = await loadConfig(flags.profile);
    const callerToken = requireToken(flags.token, config);

    const newName = flags.name.trim();
    if (!newName) bail(this, flags.json, 'Name cannot be empty');

    let updated: TokenSummary;
    try {
      const res = await fetch(`${BACKEND_URL}/v3/api-tokens/${encodeURIComponent(args.id)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${callerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) await throwHttpError(res);
      updated = (await res.json()) as TokenSummary;
    } catch (e) {
      bail(this, flags.json, e);
    }

    if (flags.json) {
      this.log(JSON.stringify(updated, null, 2));
      return;
    }

    this.log(chalk.green(`\n  ✓ Renamed to "${updated.name}"\n`));
  }
}
