import { Hook } from '@oclif/core';
import {
  startCommandSpan,
  isTelemetryEnabled,
  shouldShowTelemetryNotice,
  setTag,
  setContext,
} from '../lib/telemetry.js';
import { loadConfigFile, saveConfigFile } from '../lib/config.js';

const hook: Hook<'prerun'> = async function (opts) {
  const commandId = opts.Command.id;

  // First-run notice: show once then persist opt-in
  if (shouldShowTelemetryNotice()) {
    process.stderr.write(
      'Linq CLI collects anonymous usage data. Disable with: linq config set telemetry false\n'
    );
    try {
      const configFile = await loadConfigFile();
      configFile.telemetry = true;
      await saveConfigFile(configFile);
    } catch {
      // Non-fatal — don't block CLI startup
    }
  }

  if (!isTelemetryEnabled()) return;

  // Set Sentry context for this command
  setTag('command', commandId);

  // Record flag names only (no values) for debugging context
  const flagNames = Object.keys(opts.argv ?? {});
  if (flagNames.length > 0) {
    setContext('flags', { names: flagNames });
  }

  startCommandSpan(commandId);
};

export default hook;
