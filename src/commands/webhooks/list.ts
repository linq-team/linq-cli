import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class WebhooksList extends Command {
  static override description = 'List all webhook subscriptions';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
    json: Flags.boolean({
      description: 'Output response as JSON',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksList);

    const config = await loadConfig();
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/webhook-subscriptions');

    if (error) {
      this.error(`Failed to list webhooks: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to list webhooks: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    const subscriptions = data.subscriptions;

    if (subscriptions.length === 0) {
      this.log('No webhook subscriptions found.');
      return;
    }

    // Print table header
    this.log(`${'ID'.padEnd(38)} ${'ACTIVE'.padEnd(8)} ${'URL'.padEnd(40)} ${'EVENTS'}`);
    this.log(`${'--'.padEnd(38)} ${'------'.padEnd(8)} ${'---'.padEnd(40)} ${'------'}`);

    for (const sub of subscriptions) {
      const eventCount = sub.subscribed_events.length;
      const eventsDisplay =
        eventCount > 2
          ? `${sub.subscribed_events.slice(0, 2).join(', ')}... (+${eventCount - 2})`
          : sub.subscribed_events.join(', ');
      const activeStr = sub.is_active ? 'yes' : 'no';

      this.log(
        `${sub.id.padEnd(38)} ${activeStr.padEnd(8)} ${sub.target_url.slice(0, 40).padEnd(40)} ${eventsDisplay}`
      );
    }
  }
}
