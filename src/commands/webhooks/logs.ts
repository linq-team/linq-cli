import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../lib/base-command.js';
import { loadConfig, requireToken } from '../../lib/config.js';

const V3_LOGS_URL = process.env.LINQ_LOGS_URL || 'https://v3-logs.linqapp.com/api';
const POLL_INTERVAL_MS = 3000;

interface WebhookLog {
  event_id: string;
  webhook_event_type: string;
  target_url: string;
  http_status_code: number;
  duration_ms: number;
  timestamp: string;
  status: string;
  attempt: number;
  max_attempts: number;
  error_type: string;
  error_message: string;
  trace_id: string;
  subscription_id: string;
}

interface WebhookLogsResponse {
  webhook_logs: WebhookLog[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    per_page: number;
  };
}

export default class WebhooksLogs extends BaseCommand {
  static override description = 'View delivery logs for a webhook subscription';

  static override examples = [
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --tail',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --status failed',
    '<%= config.bin %> <%= command.id %> SUBSCRIPTION_ID --last 50',
  ];

  static override args = {
    subscriptionId: Args.string({
      description: 'Webhook subscription ID',
      required: true,
    }),
  };

  static override flags = {
    tail: Flags.boolean({
      description: 'Continuously poll for new logs',
      default: false,
    }),
    last: Flags.integer({
      description: 'Number of recent logs to show (default: 20)',
      default: 20,
    }),
    status: Flags.string({
      description: 'Filter by status',
      options: ['success', 'failed', 'retrying', 'all'],
      default: 'all',
    }),
    event: Flags.string({
      description: 'Filter by event type (e.g. message.received)',
    }),
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  };

  private stopped = false;

  async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhooksLogs);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);

    const orgId = config.orgId;
    if (!orgId) {
      this.log(chalk.yellow('\n  Organization ID not found in your profile.'));
      this.log(`  Run ${chalk.cyan('linq login')} to refresh your credentials.\n`);
      this.exit(1);
    }

    if (flags.tail) {
      await this.tailLogs(args.subscriptionId, orgId, token, flags);
    } else {
      await this.fetchLogs(args.subscriptionId, orgId, token, flags);
    }
  }

  private async fetchLogs(
    subscriptionId: string,
    orgId: string,
    token: string,
    flags: { last: number; status: string; event?: string; json: boolean },
  ): Promise<void> {
    const data = await this.queryLogs(subscriptionId, orgId, token, flags.last, flags.status, flags.event);

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    if (data.webhook_logs.length === 0) {
      this.log('\n  No delivery logs found for this subscription.\n');
      return;
    }

    this.log('');
    for (const log of data.webhook_logs) {
      this.printLog(log);
    }
    this.log('');
  }

  private async tailLogs(
    subscriptionId: string,
    orgId: string,
    token: string,
    flags: { status: string; event?: string; json: boolean },
  ): Promise<void> {
    const shutdown = () => {
      this.stopped = true;
      this.log(chalk.dim('\nStopped.'));
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    this.log(`\n  Tailing logs for subscription ${chalk.dim(subscriptionId)}... ${chalk.dim('(Ctrl+C to stop)')}\n`);

    const seenIds = new Set<string>();

    // Fetch initial batch to seed seenIds
    const initial = await this.queryLogs(subscriptionId, orgId, token, 10, flags.status, flags.event);
    for (const log of initial.webhook_logs) {
      seenIds.add(log.event_id + ':' + log.attempt);
      if (!flags.json) {
        this.printLog(log);
      } else {
        this.log(JSON.stringify(log));
      }
    }

    // Poll for new logs
    while (!this.stopped) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      if (this.stopped) break;

      try {
        const data = await this.queryLogs(subscriptionId, orgId, token, 20, flags.status, flags.event);

        for (const log of data.webhook_logs) {
          const key = log.event_id + ':' + log.attempt;
          if (seenIds.has(key)) continue;
          seenIds.add(key);

          if (flags.json) {
            this.log(JSON.stringify(log));
          } else {
            this.printLog(log);
          }
        }

        // Prevent seenIds from growing unbounded
        if (seenIds.size > 5000) {
          const entries = [...seenIds];
          for (let i = 0; i < 2500; i++) {
            seenIds.delete(entries[i]);
          }
        }
      } catch {
        // Silently skip failed polls, will retry on next interval
      }
    }
  }

  private async queryLogs(
    subscriptionId: string,
    orgId: string,
    token: string,
    limit: number,
    status: string,
    event?: string,
  ): Promise<WebhookLogsResponse> {
    const params = new URLSearchParams();
    params.set('partner_id', orgId);
    params.set('org_id', orgId);
    params.set('subscription_id', subscriptionId);
    params.set('per_page', String(Math.min(limit, 50)));
    if (status && status !== 'all') params.set('status', status);
    if (event) params.set('event_type', event);

    const res = await fetch(`${V3_LOGS_URL}/v1/webhook-logs?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${res.status}: ${err}`);
    }

    return (await res.json()) as WebhookLogsResponse;
  }

  private printLog(log: WebhookLog): void {
    const time = chalk.dim(new Date(log.timestamp).toLocaleString());
    const event = log.webhook_event_type.padEnd(30);

    let statusStr: string;
    switch (log.status) {
      case 'success':
        statusStr = chalk.green(`${log.http_status_code} OK`);
        break;
      case 'failed':
        statusStr = chalk.red(`${log.http_status_code || 'ERR'} Failed`);
        break;
      case 'retrying':
        statusStr = chalk.yellow(`${log.http_status_code || '---'} Retry ${log.attempt}/${log.max_attempts}`);
        break;
      default:
        statusStr = String(log.http_status_code || log.status);
    }

    const duration = chalk.dim(`${log.duration_ms}ms`);

    this.log(`  ${time}  ${event}  ${statusStr}  ${duration}`);

    if (log.error_message && log.status !== 'success') {
      this.log(`  ${chalk.dim('  ' + log.error_message)}`);
    }
  }
}
