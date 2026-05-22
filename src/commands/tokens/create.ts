import { Flags } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import {
  TokenSummaryWithSecret,
  parseExpiresIn,
  formatExpiresAt,
} from '../../lib/tokens-helpers.js';
import { bail, throwHttpError } from '../../lib/errors.js';

const EXPIRATION_CHOICES = [
  { name: '7 days', value: '7d' },
  { name: '30 days', value: '30d' },
  { name: '60 days', value: '60d' },
  { name: '90 days', value: '90d' },
  { name: 'Custom date', value: 'custom' },
  { name: 'Never', value: 'none' },
];

export default class TokensCreate extends BaseCommand {
  static override description = 'Create a new API token';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --name "My CLI Token"',
    '<%= config.bin %> <%= command.id %> --name "Worker" --expires-in 30d',
    '<%= config.bin %> <%= command.id %> --name "Test" --expires-in 2026-12-01',
  ];

  static override flags = {
    name: Flags.string({ char: 'n', description: 'Token name' }),
    'expires-in': Flags.string({
      description: 'Expiration: 7d, 30d, 60d, 90d, none, or YYYY-MM-DD (default: none)',
    }),
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TokensCreate);
    const config = await loadConfig(flags.profile);
    const callerToken = requireToken(flags.token, config);

    const anyFlagProvided = flags.name !== undefined || flags['expires-in'] !== undefined;
    const interactive = !!process.stdin.isTTY && !anyFlagProvided;

    let name: string | undefined = flags.name?.trim();
    let expiresIn: string | undefined = flags['expires-in'];

    if (interactive) {
      try {
        name = (await input({
          message: 'Name:',
          validate: (v) => (v.trim() ? true : 'Name cannot be empty'),
        })).trim();

        const choice = await select({
          message: 'Expiration:',
          choices: EXPIRATION_CHOICES,
        });

        if (choice === 'custom') {
          expiresIn = (await input({
            message: 'Expiration date (YYYY-MM-DD):',
            validate: (v) =>
              /^\d{4}-\d{2}-\d{2}$/.test(v.trim())
                ? true
                : 'Enter a date as YYYY-MM-DD',
          })).trim();
        } else {
          expiresIn = choice;
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'ExitPromptError') this.exit(1);
        throw e;
      }
    } else {
      if (!name) {
        bail(this, flags.json, 'Missing --name. Required when running non-interactively.');
      }
      // expiresIn defaults to undefined → no expiration
    }

    let expiresAt: string | undefined;
    try {
      expiresAt = parseExpiresIn(expiresIn);
    } catch (e) {
      bail(this, flags.json, e);
    }

    const body: { name: string; expiresAt?: string } = { name };
    if (expiresAt) body.expiresAt = expiresAt;

    let created: TokenSummaryWithSecret;
    try {
      const res = await fetch(`${BACKEND_URL}/v3/api-tokens`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${callerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) await throwHttpError(res);
      created = (await res.json()) as TokenSummaryWithSecret;
    } catch (e) {
      bail(this, flags.json, e);
    }

    if (flags.json) {
      this.log(JSON.stringify(created, null, 2));
      return;
    }

    this.log(chalk.green('\n  ✓ Token created!\n'));
    this.log(`  ${chalk.dim('Name:')}     ${created.name || '(unnamed)'}`);
    this.log(`  ${chalk.dim('ID:')}       ${created.id}`);
    this.log(`  ${chalk.dim('Expires:')}  ${formatExpiresAt(created.expiresAt)}`);
    this.log('');
    this.log(`  ${chalk.dim('Token:')}`);
    this.log(`    ${chalk.bold(created.token)}`);
    this.log('');
    this.log(chalk.yellow('  ⚠  Save this token securely — it will not be shown again.'));
    this.log('');
  }
}
