import { Hook } from '@oclif/core';
import { finishCommandSpan, shutdown } from '../lib/telemetry.js';

const hook: Hook<'postrun'> = async function () {
  finishCommandSpan('ok');
  await shutdown();
};

export default hook;
