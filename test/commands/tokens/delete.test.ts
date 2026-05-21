import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockInput = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  input: (...args: unknown[]) => mockInput(...args),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { default: TokensDelete } = await import('../../../src/commands/tokens/delete.js');

describe('tokens delete', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let originalIsTTY: boolean | undefined;
  let originalCI: string | undefined;
  let originalClaude: string | undefined;
  let originalCursor: string | undefined;
  let originalAider: string | undefined;
  const STORED = 'linq_abc12345XXXXXXXXXXXXXXXXXXXXXX';

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    mockInput.mockReset();

    originalIsTTY = process.stdin.isTTY;
    originalCI = process.env.CI;
    originalClaude = process.env.CLAUDECODE;
    originalCursor = process.env.CURSOR_TRACE_ID;
    originalAider = process.env.AIDER_API_KEY;

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
    (process.stdin as unknown as { isTTY: boolean | undefined }).isTTY = originalIsTTY;
    process.env.CI = originalCI;
    process.env.CLAUDECODE = originalClaude;
    process.env.CURSOR_TRACE_ID = originalCursor;
    process.env.AIDER_API_KEY = originalAider;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function setInteractive() {
    (process.stdin as unknown as { isTTY: boolean }).isTTY = true;
    delete process.env.CI;
    delete process.env.CLAUDECODE;
    delete process.env.CURSOR_TRACE_ID;
    delete process.env.AIDER_API_KEY;
  }

  function setTTY(value: boolean) {
    (process.stdin as unknown as { isTTY: boolean }).isTTY = value;
  }

  it('refuses in non-interactive environments', async () => {
    setTTY(false);
    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensDelete(['some-id'], config);
    await expect(cmd.run()).rejects.toThrow(/interactive-only/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('hard-refuses deleting the active token', async () => {
    setInteractive();
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensDelete(['active-id'], config);
    await expect(cmd.run()).rejects.toThrow(/currently logged in with/);
    expect(mockInput).not.toHaveBeenCalled();
  });

  it('errors if the token id is unknown', async () => {
    setInteractive();
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensDelete(['unknown-id'], config);
    await expect(cmd.run()).rejects.toThrow(/No token found/);
  });

  it('aborts if user does not type "yes"', async () => {
    setInteractive();
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
        { id: 'other-id', name: 'Other', tokenPrefix: 'XYZ12345', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));
    mockInput.mockResolvedValueOnce('no');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensDelete(['other-id'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    // Should not have called DELETE
    const calls = mockFetch.mock.calls.map((c) => (c[1] as RequestInit | undefined)?.method);
    expect(calls).not.toContain('DELETE');
  });

  it('deletes when user confirms with "yes"', async () => {
    setInteractive();
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, {
        tokens: [
          { id: 'active-id', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
          { id: 'other-id', name: 'Other', tokenPrefix: 'XYZ12345', scopes: [], expiresAt: null, lastUsedAt: null },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'other-id', deleted: true }));

    mockInput.mockResolvedValueOnce('yes');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensDelete(['other-id'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    const deleteCall = mockFetch.mock.calls.find(
      (c) => (c[1] as RequestInit | undefined)?.method === 'DELETE'
    );
    expect(deleteCall).toBeDefined();
    expect(deleteCall![0]).toContain('/v3/api-tokens/other-id');
  });
});
