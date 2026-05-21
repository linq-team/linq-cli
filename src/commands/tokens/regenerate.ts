import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import {
  loadConfig,
  requireToken,
  saveProfile,
  getCurrentProfile,
} from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import {
  ListTokensResponse,
  TokenSummaryWithSecret,
  parseExpiresIn,
  formatExpiresAt,
  findActiveTokenId,
} from '../../lib/tokens-helpers.js';

export default class TokensRegenerate extends BaseCommand {
  static override description =
    'Regenerate an API token (mints a new secret, immediately expires the old one)';

  static override examples = [
    '<%= config.bin %> <%= command.id %> <id>',
    '<%= config.bin %> <%= command.id %> <id> --expires-in 30d',
  ];

  static override args = {
    id: Args.string({ description: 'Token ID to regenerate', required: true }),
  };

  static override flags = {
    'expires-in': Flags.string({
      description: 'Expiration: 7d, 30d, 60d, 90d, none, or YYYY-MM-DD',
      default: 'none',
    }),
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TokensRegenerate);
    const config = await loadConfig(flags.profile);
    const callerToken = requireToken(flags.token, config);

    let expiresAt: string | undefined;
    try {
      expiresAt = parseExpiresIn(flags['expires-in']);
    } catch (e) {
      this.error(e instanceof Error ? e.message : String(e));
    }

    // Detect whether the target is the active token (so we can auto-update
    // the local profile after regenerate — the old secret is now invalid).
    let isActive = false;
    try {
      const listRes = await fetch(`${BACKEND_URL}/v3/api-tokens`, {
        headers: { Authorization: `Bearer ${callerToken}` },
      });
      if (listRes.ok) {
        const list = (await listRes.json()) as ListTokensResponse;
        const activeId = findActiveTokenId(callerToken, list.tokens);
        isActive = !!activeId && activeId === args.id;
      }
    } catch {
      // Non-fatal — we just won't auto-update the profile if we can't check.
    }

    const body: { expiresAt?: string } = {};
    if (expiresAt) body.expiresAt = expiresAt;

    let created: TokenSummaryWithSecret;
    try {
      const res = await fetch(
        `${BACKEND_URL}/v3/api-tokens/${encodeURIComponent(args.id)}/regenerate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${callerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        this.error(err.message || `Failed to regenerate token (${res.status})`);
      }
      created = (await res.json()) as TokenSummaryWithSecret;
    } catch (e) {
      if (e instanceof Error && 'oclif' in e) throw e;
      this.error('Could not connect to Linq. Please try again later.');
    }

    let profileUpdated = false;
    if (isActive && created.token) {
      const profileName = flags.profile || (await getCurrentProfile()) || 'default';
      try {
        await saveProfile(profileName, { token: created.token });
        profileUpdated = true;
      } catch {
        // Non-fatal — user can still manually update with linq login --token
      }
    }

    if (flags.json) {
      this.log(JSON.stringify({ ...created, profileUpdated }, null, 2));
      return;
    }

    this.log(chalk.green('\n  ✓ Token regenerated. The old token has been expired.\n'));
    this.log(`  ${chalk.dim('Name:')}     ${created.name || '(unnamed)'}`);
    this.log(`  ${chalk.dim('ID:')}       ${created.id}`);
    this.log(`  ${chalk.dim('Expires:')}  ${formatExpiresAt(created.expiresAt)}`);
    this.log('');
    this.log(`  ${chalk.dim('Token:')}`);
    this.log(`    ${chalk.bold(created.token)}`);
    this.log('');
    this.log(chalk.yellow('  ⚠  Save this token securely — it will not be shown again.'));
    if (profileUpdated) {
      this.log('');
      this.log(chalk.green("  ✓ Local profile updated. You're already logged in with the new token."));
    } else if (isActive) {
      this.log('');
      this.log(chalk.yellow(
        '  ⚠  This was your active token. Run `linq login --token <new>` to update your local config.'
      ));
    }
    this.log('');
  }
}
