#!/usr/bin/env node

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
