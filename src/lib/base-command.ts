import { Command } from '@oclif/core';
import { captureError, finishCommandSpan, shutdown } from './telemetry.js';

export abstract class BaseCommand extends Command {
  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    finishCommandSpan('error');
    captureError(err);
    await shutdown();
    throw err;
  }
}
