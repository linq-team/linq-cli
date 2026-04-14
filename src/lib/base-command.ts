import { Command, Errors } from '@oclif/core';
import chalk from 'chalk';
import { captureError, finishCommandSpan, shutdown } from './telemetry.js';

export abstract class BaseCommand extends Command {
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

    // All other CLI errors — clean single-line output
    if (err instanceof Errors.CLIError) {
      this.log(chalk.red(`\n  Error: ${err.message}\n`));
      this.exit(2);
      return;
    }

    throw err;
  }
}
