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

const { default: TokensRegenerate } = await import('../../../src/commands/tokens/regenerate.js');

describe('tokens regenerate', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  const STORED = 'linq_abc12345XXXXXXXXXXXXXXXXXXXXXX';

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
        profiles: { default: { token: STORED } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function configPath() {
    return path.join(tempDir, '.linq', 'config.json');
  }

  it('regenerating a non-active token does NOT update local profile', async () => {
    // 1st call: list, used to detect active
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
        { id: 'other-id', name: 'Other', tokenPrefix: 'XYZ12345', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));
    // 2nd call: regenerate
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      id: 'other-id', name: 'Other', tokenPrefix: 'linq_new',
      scopes: [], expiresAt: null, lastUsedAt: null,
      createdAt: '2026-05-20T00:00:00Z', token: 'linq_newSECRET',
    }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensRegenerate(['other-id'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    // Config token unchanged
    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe(STORED);
  });

  it('regenerating the active token DOES update local profile', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      id: 'active-id', name: 'Mine', tokenPrefix: 'linq_new',
      scopes: [], expiresAt: null, lastUsedAt: null,
      createdAt: '2026-05-20T00:00:00Z', token: 'linq_newSECRET999',
    }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensRegenerate(['active-id'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe('linq_newSECRET999');
  });

  it('regenerate server error surfaces message', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { tokens: [] }));
    mockFetch.mockResolvedValueOnce(jsonResponse(500, { message: 'PNS down' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensRegenerate(['some-id'], config);
    await expect(cmd.run()).rejects.toThrow(/PNS down/);
  });
});
