import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class AttachmentsGet extends Command {
  static override description = 'Get attachment metadata';

  static override examples = [
    '<%= config.bin %> <%= command.id %> ATTACHMENT_ID',
  ];

  static override args = {
    attachmentId: Args.string({
      description: 'Attachment ID (UUID)',
      required: true,
    }),
  };

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AttachmentsGet);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.GET('/v3/attachments/{attachmentId}', {
      params: { path: { attachmentId: args.attachmentId } },
    });

    if (error) {
      this.error(`Failed to get attachment: ${JSON.stringify(error)}`);
    }

    if (!data) {
      this.error('Failed to get attachment: no response data');
    }

    this.log(JSON.stringify(data, null, 2));
  }
}
