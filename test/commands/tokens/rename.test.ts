import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { default: TokensRename } = await import('../../../src/commands/tokens/rename.js');

describe('tokens rename', () => {
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
      JSON.stringify({
        profile: 'default',
        profiles: { default: { token: 'caller-token' } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('PUTs to /v3/api-tokens/:id with the new name', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'abc', name: 'New Name', tokenPrefix: 'linq_xxx',
        scopes: [], expiresAt: null, lastUsedAt: null,
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensRename(['abc', '--name', 'New Name'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v3/api-tokens/abc');
    expect((init as RequestInit).method).toBe('PUT');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ name: 'New Name' });
  });

  it('surfaces server error message', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(404, { message: 'Token not found' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensRename(['abc', '--name', 'X'], config);
    await expect(cmd.run()).rejects.toThrow(/Token not found/);
  });
});
