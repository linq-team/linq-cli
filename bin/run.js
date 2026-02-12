#!/usr/bin/env node

import { execute } from '@oclif/core';

await execute({ dir: import.meta.url }).catch((err) => {
  const msg = err.message || String(err);
  console.error(`Error: ${msg}`);
  process.exit(err.exitCode ?? 1);
});
