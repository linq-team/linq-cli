import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import AttachmentsGet from '../../../src/commands/attachments/get.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('attachments get', () => {
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

  it('gets attachment metadata', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        id: 'att-123',
        filename: 'photo.jpg',
        content_type: 'image/jpeg',
        size_bytes: 1024000,
        status: 'complete',
        download_url: 'https://cdn.example.com/photo.jpg',
        created_at: '2024-01-15T10:30:00Z',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new AttachmentsGet(['att-123'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/attachments/att-123');
    expect(request.method).toBe('GET');
  });

  it('requires attachment ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new AttachmentsGet([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
