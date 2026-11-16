import { Command, Errors } from '@oclif/core';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { captureError, finishCommandSpan, shutdown } from './telemetry.js';

export abstract class BaseCommand extends Command {
  // Fire once per command: check npm for a newer @linqapp/cli, print a one-line
  // notice to stderr if there is one. update-notifier caches the answer under
  // ~/.config so the registry only gets hit once a day.
  protected override async init(): Promise<void> {
    await super.init();
    try {
      updateNotifier({
        pkg: this.config.pjson as { name: string; version: string },
        updateCheckInterval: 1000 * 60 * 60 * 24,
      }).notify({ isGlobal: true, defer: false });
    } catch {
      // Never let a stale-version check break the real command.
    }
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    // Let exit errors pass through (from this.exit())
    if (err instanceof Errors.ExitError) {
      throw err;
    }

    finishCommandSpan('error');
    captureError(err);
    await shutdown();

    // Missing required flags — show helpful per-flag descriptions
    if (err instanceof Errors.CLIError && err.constructor.name === 'FailedFlagValidationError') {
      const missing = [...err.message.matchAll(/Missing required flag (\w[\w-]*)/g)].map((m) => m[1]);
      if (missing.length > 0) {
        const ctor = this.constructor as typeof BaseCommand & {
          flags?: Record<string, { char?: string; description?: string }>;
        };
        const flagDefs = ctor.flags ?? {};
        const lines = missing.map((name) => {
          const def = flagDefs[name];
          const flag = def?.char ? `--${name}, -${def.char}` : `--${name}`;
          const desc = def?.description ? `  ${def.description}` : '';
          return `  ${chalk.bold(flag)}${desc}`;
        });
        const label = missing.length === 1 ? 'Missing 1 required flag' : `Missing ${missing.length} required flags`;
        this.log(`\n${label}:\n${lines.join('\n')}\n\nRun with --help for usage.\n`);
        this.exit(2);
        return;
      }
    }

    // All other CLI errors — clean single-line output. Honor the error's
    // own exit code when it specified one (e.g. requireToken uses 1).
    if (err instanceof Errors.CLIError) {
      this.log(chalk.red(`\n  Error: ${err.message}\n`));
      const code = (err as Error & { oclif?: { exit?: number } }).oclif?.exit ?? 2;
      this.exit(code);
      return;
    }

    throw err;
  }
}
