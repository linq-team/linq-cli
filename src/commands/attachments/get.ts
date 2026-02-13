import { Args, Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createLinqClient } from '../../lib/api-client.js';
import { formatAttachmentMeta } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';

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
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
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
    const client = createLinqClient(token);

    try {
      const data = await client.attachments.getAttachment(args.attachmentId);

      if (flags.json) {
        this.log(JSON.stringify(data, null, 2));
      } else {
        this.log(formatAttachmentMeta(data));
      }
    } catch (err) {
      this.error(`Failed to get attachment: ${parseApiError(err)}`);
    }
  }
}
