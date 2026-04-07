import { Command, Errors } from '@oclif/core';
import chalk from 'chalk';
import { captureError, finishCommandSpan, shutdown } from './telemetry.js';

export abstract class BaseCommand extends Command {
  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    // Let exit errors pass through (from this.exit())
    if (err instanceof Errors.ExitError) {
      throw err;
    }
    // Clean output for user-facing errors (missing args, flags, validation)
    if (err instanceof Errors.CLIError || (err as any).oclif) {
      this.log(chalk.red(`\n  Error: ${err.message}\n`));
      this.exit(2);
      return;
    }
    finishCommandSpan('error');
    captureError(err);
    await shutdown();
    throw err;
  }
}
