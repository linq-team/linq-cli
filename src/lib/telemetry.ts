import * as Sentry from '@sentry/node';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const SENTRY_DSN =
  'https://2693fb36d15f1a707be672d1b51b819c@o1196146.ingest.us.sentry.io/4510880227000320';

let telemetryEnabled = false;

function getConfigPath(): string {
  const home = process.env.HOME || homedir();
  return join(home, '.linq', 'config.json');
}

function readTelemetrySetting(): boolean | undefined {
  try {
    const raw = readFileSync(getConfigPath(), 'utf-8');
    const config = JSON.parse(raw);
    return config.telemetry;
  } catch {
    return undefined;
  }
}

function getCliVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require('../../package.json');
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function isOptedOut(): boolean {
  // Env var check: LINQ_TELEMETRY=0 or LINQ_TELEMETRY=false
  const envVal = process.env.LINQ_TELEMETRY;
  if (envVal === '0' || envVal === 'false') return true;

  // Config file check
  const setting = readTelemetrySetting();
  if (setting === false) return true;

  return false;
}

export function isTelemetryEnabled(): boolean {
  return telemetryEnabled;
}

export interface TelemetryOptions {
  environment?: string;
}

export function initTelemetry(options?: TelemetryOptions): void {
  if (isOptedOut()) {
    telemetryEnabled = false;
    return;
  }

  telemetryEnabled = true;

  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: false,
    release: `linq-cli@${getCliVersion()}`,
    environment: options?.environment || process.env.NODE_ENV || 'production',
    // Minimal performance sampling — just enough to track command usage
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Strip any potentially sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          if (breadcrumb.data) {
            delete breadcrumb.data.token;
            delete breadcrumb.data.phone;
          }
        }
      }
      return event;
    },
  });

  Sentry.setTag('os', process.platform);
  Sentry.setTag('arch', process.arch);
  Sentry.setTag('node', process.version);
}

let activeSpan: Sentry.Span | undefined;

export function startCommandSpan(commandId: string): void {
  if (!telemetryEnabled) return;
  activeSpan = Sentry.startInactiveSpan({
    name: commandId,
    op: 'command.run',
    forceTransaction: true,
  });
}

export function finishCommandSpan(status?: 'ok' | 'error'): void {
  if (!telemetryEnabled || !activeSpan) return;
  if (status) {
    activeSpan.setStatus({ code: status === 'ok' ? 1 : 2 });
  }
  activeSpan.end();
  activeSpan = undefined;
}

export function captureError(error: unknown): void {
  if (!telemetryEnabled) return;
  Sentry.captureException(error);
}

export async function shutdown(): Promise<void> {
  if (!telemetryEnabled) return;
  await Sentry.flush(2000);
}

/**
 * Returns whether the first-run telemetry notice should be shown.
 * This is true when the telemetry key has never been set in config.
 */
export function shouldShowTelemetryNotice(): boolean {
  return readTelemetrySetting() === undefined;
}
