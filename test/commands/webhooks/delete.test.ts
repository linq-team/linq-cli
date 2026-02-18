import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import WebhooksDelete from '../../../src/commands/webhooks/delete.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body?: unknown) {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('webhooks delete', () => {
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

  it('deletes webhook successfully', async () => {
    mockFetch.mockResolvedValue(createMockResponse(204, {}));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksDelete(['webhook-123'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.linqapp.com/api/partner/v3/webhook-subscriptions/webhook-123'
    );
    expect((init as RequestInit).method).toBe('DELETE');
  });

  it('requires subscription ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksDelete([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
