import { Args, Flags } from '@oclif/core';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';
import { BACKEND_URL } from '../../lib/api-client.js';
import {
  ListTokensResponse,
  findActiveTokenId,
  isAutomatedEnv,
} from '../../lib/tokens-helpers.js';

export default class TokensDelete extends BaseCommand {
  static override description = 'Delete an API token (interactive only)';

  static override examples = [
    '<%= config.bin %> <%= command.id %> <id>',
  ];

  static override args = {
    id: Args.string({ description: 'Token ID to delete', required: true }),
  };

  static override flags = {
    profile: Flags.string({ char: 'p', description: 'Config profile to use', hidden: true }),
    token: Flags.string({ char: 't', description: 'API token', hidden: true }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TokensDelete);

    // Hard refuse for non-interactive / automated environments.
    if (isAutomatedEnv()) {
      this.error(
        'linq tokens delete is an interactive-only command.\n  Detected running in a script, CI, or by an AI assistant.',
      );
    }

    const config = await loadConfig(flags.profile);
    const callerToken = requireToken(flags.token, config);

    // Fetch the full token list so we can: (1) show the target's name/prefix,
    // (2) detect if the target is the currently-active token.
    let list: ListTokensResponse;
    try {
      const res = await fetch(`${BACKEND_URL}/v3/api-tokens`, {
        headers: { Authorization: `Bearer ${callerToken}` },
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        this.error(err.message || `Failed to list tokens (${res.status})`);
      }
      list = (await res.json()) as ListTokensResponse;
    } catch (e) {
      if (e instanceof Error && 'oclif' in e) throw e;
      this.error('Could not connect to Linq. Please try again later.');
    }

    const target = list.tokens.find((t) => t.id === args.id);
    if (!target) {
      this.error(`No token found with id "${args.id}".`);
    }

    const activeId = findActiveTokenId(callerToken, list.tokens);
    if (activeId && target.id === activeId) {
      this.error(
        'Cannot delete the token you are currently logged in with.\n' +
        `  Active token: ${target.tokenPrefix}...  (${target.name || 'unnamed'})\n` +
        '  Log in with a different token first (linq login --token ...), then try again.'
      );
    }

    this.log('');
    this.log('  Token to delete:');
    this.log(`    ${chalk.dim('Name:')}    ${target.name || '(unnamed)'}`);
    this.log(`    ${chalk.dim('Prefix:')}  ${target.tokenPrefix}...`);
    this.log(`    ${chalk.dim('ID:')}      ${target.id}`);
    this.log('');
    this.log(chalk.yellow('  This is permanent. The token will be revoked and cannot be recovered.'));
    this.log('');

    let answer: string;
    try {
      answer = await input({
        message: 'Type "yes" to confirm:',
      });
    } catch (e) {
      if (e instanceof Error && e.name === 'ExitPromptError') {
        this.log(chalk.dim('  Aborted.\n'));
        this.exit(1);
      }
      throw e;
    }

    if (answer.trim().toLowerCase() !== 'yes') {
      this.log(chalk.dim('\n  Aborted.\n'));
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/v3/api-tokens/${encodeURIComponent(target.id)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${callerToken}` },
        }
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        this.error(err.message || `Failed to delete token (${res.status})`);
      }
    } catch (e) {
      if (e instanceof Error && 'oclif' in e) throw e;
      this.error('Could not connect to Linq. Please try again later.');
    }

    this.log(chalk.green(`\n  ✓ Deleted "${target.name || target.tokenPrefix + '...'}"\n`));
  }
}
