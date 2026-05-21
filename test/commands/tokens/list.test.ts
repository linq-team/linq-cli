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

const { default: TokensList } = await import('../../../src/commands/tokens/list.js');

describe('tokens list', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let logs: string[] = [];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    logs = [];

    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: { default: { token: 'linq_abc123XXXXXXXXXXXXXXXXXXXXXX' } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function newCmd(argv: string[]): TokensList {
    return new TokensList(argv, new Proxy({} as Config, { get: () => undefined }));
  }

  it('renders empty state when no tokens', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { tokens: [] }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensList([], config);
    const logSpy = vi.spyOn(cmd, 'log').mockImplementation((m?: string) => { logs.push(m ?? ''); });
    await cmd.run();

    expect(logs.join('\n')).toContain('No tokens yet');
  });

  it('renders tokens with active marker on the matching prefix', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      tokens: [
        { id: 'id-1', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
        { id: 'id-2', name: 'Other', tokenPrefix: 'XYZ12345', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensList([], config);
    const logSpy = vi.spyOn(cmd, 'log').mockImplementation((m?: string) => { logs.push(m ?? ''); });
    await cmd.run();

    const out = logs.join('\n');
    expect(out).toContain('id-1');
    expect(out).toContain('Mine');
    expect(out).toContain('active');
    // active marker should appear on the Mine row, not on Other
    const mineLine = logs.find((l) => l.includes('id-1'));
    const otherLine = logs.find((l) => l.includes('id-2'));
    expect(mineLine).toMatch(/active/);
    expect(otherLine).not.toMatch(/active/);
  });

  it('--json outputs the raw response', async () => {
    const body = {
      tokens: [
        { id: 'id-1', name: 'Mine', tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
      ],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(200, body));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensList(['--json'], config);
    const logSpy = vi.spyOn(cmd, 'log').mockImplementation((m?: string) => { logs.push(m ?? ''); });
    await cmd.run();

    expect(JSON.parse(logs.join(''))).toEqual(body);
  });

  it('errors on server failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(500, { message: 'boom' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensList([], config);
    await expect(cmd.run()).rejects.toThrow(/boom/);
  });
});
