import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockInput = vi.fn();
const mockSelect = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  input: (...args: unknown[]) => mockInput(...args),
  select: (...args: unknown[]) => mockSelect(...args),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { default: TokensCreate } = await import('../../../src/commands/tokens/create.js');

describe('tokens create', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let logs: string[] = [];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    mockInput.mockReset();
    mockSelect.mockReset();
    logs = [];

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

  it('non-interactive: --name only → posts with no expiresAt', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(201, {
        id: 'new-id',
        name: 'Test',
        tokenPrefix: 'linq_xxx',
        scopes: [],
        expiresAt: null,
        lastUsedAt: null,
        createdAt: '2026-05-20T00:00:00Z',
        token: 'linq_xxxFULLSECRET',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensCreate(['--name', 'Test'], config);
    const logSpy = vi.spyOn(cmd, 'log').mockImplementation((m?: string) => { logs.push(m ?? ''); });
    await cmd.run();

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v3/api-tokens');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ name: 'Test' });
    expect(mockInput).not.toHaveBeenCalled();
    expect(mockSelect).not.toHaveBeenCalled();
    expect(logs.join('\n')).toContain('linq_xxxFULLSECRET');
    expect(logs.join('\n')).toContain('Save this token');
  });

  it('non-interactive: --name + --expires-in 30d → posts with expiresAt set', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(201, {
        id: 'new-id', name: 'Test', tokenPrefix: 'linq_xxx',
        scopes: [], expiresAt: null, lastUsedAt: null,
        createdAt: '2026-05-20T00:00:00Z', token: 'linq_xxx',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensCreate(['--name', 'Test', '--expires-in', '30d'], config);
    vi.spyOn(cmd, 'log').mockImplementation(() => {});
    await cmd.run();

    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.name).toBe('Test');
    expect(typeof body.expiresAt).toBe('string');
    // 30d from now → should be a future ISO date roughly 30 days out
    const expires = new Date(body.expiresAt).getTime();
    const diffDays = (expires - Date.now()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(29);
    expect(diffDays).toBeLessThan(31);
  });

  it('non-interactive: missing --name in non-TTY → error', async () => {
    // In vitest, stdin.isTTY is undefined/false → non-interactive.
    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensCreate([], config);
    await expect(cmd.run()).rejects.toThrow(/Missing --name/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('non-interactive: invalid --expires-in → error', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensCreate(['--name', 'X', '--expires-in', 'bogus'], config);
    await expect(cmd.run()).rejects.toThrow(/Invalid --expires-in/);
  });

  it('server error → surfaces message', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(400, { message: 'Name already exists' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new TokensCreate(['--name', 'Dup'], config);
    await expect(cmd.run()).rejects.toThrow(/Name already exists/);
  });
});
