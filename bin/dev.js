#!/usr/bin/env node

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

await initTelemetry({ environment: 'development' });

await execute({ development: true, dir: import.meta.url }).catch(async (err) => {
  captureError(err);
  await shutdown(2000);
  const msg = err.message || String(err);
  console.error(`Error: ${msg}`);
  process.exit(err.exitCode ?? 1);
});
