#!/usr/bin/env node

// Suppress Node's "Importing JSON modules is an experimental feature" warning
// emitted by one of ink's transitive deps. Targeted by name + message so we
// don't accidentally swallow anything else.
const __originalEmit = process.emit;
process.emit = function (name, data) {
  if (
    name === 'warning' &&
    data?.name === 'ExperimentalWarning' &&
    /JSON modules/i.test(data?.message ?? '')
  ) {
    return false;
  }
  return __originalEmit.apply(process, arguments);
};

import { initTelemetry, captureError, shutdown } from '../dist/lib/telemetry.js';
import { execute } from '@oclif/core';

await initTelemetry();

await execute({ dir: import.meta.url }).catch(async (err) => {
  captureError(err);
  await shutdown(2000);
  const msg = err.message || String(err);
  console.error(`Error: ${msg}`);
  process.exit(err.exitCode ?? 1);
});
