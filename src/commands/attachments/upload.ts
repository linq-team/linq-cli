import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';
import { formatUploadUrl } from '../../lib/format.js';
import { parseApiError } from '../../lib/errors.js';
import type { components } from '../../gen/api-types.js';

export default class AttachmentsUpload extends Command {
  static override description = 'Request a presigned upload URL for a file';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --filename photo.jpg --content-type image/jpeg --size 1024000',
  ];

  static override flags = {
    filename: Flags.string({
      description: 'Filename (e.g. photo.jpg)',
      required: true,
    }),
    'content-type': Flags.string({
      description: 'MIME type (e.g. image/jpeg)',
      required: true,
    }),
    size: Flags.integer({
      description: 'File size in bytes',
      required: true,
    }),
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
    const { flags } = await this.parse(AttachmentsUpload);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    const { data, error } = await client.POST('/v3/attachments', {
      body: {
        filename: flags.filename,
        content_type: flags['content-type'] as components['schemas']['SupportedContentType'],
        size_bytes: flags.size,
      },
    });

    if (error) {
      this.error(`Failed to request upload: ${parseApiError(error)}`);
    }

    if (!data) {
      this.error('Failed to request upload: no response data');
    }

    if (flags.json) {
      this.log(JSON.stringify(data, null, 2));
    } else {
      this.log(formatUploadUrl(data));
    }
  }
}
