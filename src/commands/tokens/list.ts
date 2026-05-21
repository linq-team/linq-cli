import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import {
  ListTokensResponse,
  formatExpiresAt,
  formatLastUsed,
  findActiveTokenId,
} from '../../lib/tokens-helpers.js';

export default class TokensList extends BaseCommand {
  static override description = 'List API tokens for your account';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TokensList);
    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    let data: ListTokensResponse;
    try {
      const res = await fetch(`${BACKEND_URL}/v3/api-tokens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        this.error(err.message || `Failed to list tokens (${res.status})`);
      }
      data = (await res.json()) as ListTokensResponse;
    } catch (e) {
      if (e instanceof Error && 'oclif' in e) throw e;
      this.error('Could not connect to Linq. Please try again later.');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    if (data.tokens.length === 0) {
      this.log('\n  No tokens yet.\n');
      this.log(chalk.dim('  Create one: linq tokens create --name "My Token"\n'));
      return;
    }

    const activeId = findActiveTokenId(token, data.tokens);

    // Build rows
    const rows = data.tokens.map((t) => ({
      id: t.id,
      name: t.name || '(unnamed)',
      expires: formatExpiresAt(t.expiresAt),
      lastUsed: formatLastUsed(t.lastUsedAt),
      isActive: t.id === activeId,
    }));

    // Column widths
    const nameW = Math.max(4, ...rows.map((r) => r.name.length));
    const expiresW = Math.max(7, ...rows.map((r) => r.expires.length));
    const lastUsedW = Math.max(9, ...rows.map((r) => r.lastUsed.length));

    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));

    this.log(`\n  ${chalk.bold('Your API tokens')} (${data.tokens.length})\n`);
    this.log(
      '  ' +
      chalk.dim(pad('ID', 36)) + '  ' +
      chalk.dim(pad('NAME', nameW)) + '  ' +
      chalk.dim(pad('EXPIRES', expiresW)) + '  ' +
      chalk.dim(pad('LAST USED', lastUsedW))
    );
    for (const r of rows) {
      this.log(
        '  ' +
        chalk.cyan(pad(r.id, 36)) + '  ' +
        pad(r.name, nameW) + '  ' +
        pad(r.expires, expiresW) + '  ' +
        chalk.dim(pad(r.lastUsed, lastUsedW)) +
        (r.isActive ? chalk.green('  ← active') : '')
      );
    }
    this.log('');
  }
}
