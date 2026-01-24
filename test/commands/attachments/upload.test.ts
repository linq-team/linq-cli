import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import AttachmentsUpload from '../../../src/commands/attachments/upload.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('attachments upload', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();

    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({ profile: 'default', profiles: { default: { token: 'test-token' } } })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('requests presigned upload URL', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        attachment_id: 'att-123',
        upload_url: 'https://uploads.example.com/presigned',
        download_url: 'https://cdn.example.com/photo.jpg',
        http_method: 'PUT',
        expires_at: '2024-01-15T10:45:00Z',
        required_headers: { 'Content-Type': 'image/jpeg' },
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new AttachmentsUpload(
      ['--filename', 'photo.jpg', '--content-type', 'image/jpeg', '--size', '1024000'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/attachments');
    expect(request.method).toBe('POST');
    const body = await request.json();
    expect(body.filename).toBe('photo.jpg');
    expect(body.content_type).toBe('image/jpeg');
    expect(body.size_bytes).toBe(1024000);
  });

  it('requires all flags', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new AttachmentsUpload(['--filename', 'photo.jpg'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag');
  });
});
