import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockInput = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  input: (...args: unknown[]) => mockInput(...args),
}));

vi.mock('open', () => ({ default: vi.fn() }));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { default: Signup } = await import('../../src/commands/signup.js');

// Prevent real sleeps in tests
vi.spyOn(Signup.prototype as never, 'sleep').mockResolvedValue(undefined);

describe('signup', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    mockInput.mockReset();
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function cachePath() {
    return path.join(tempDir, '.linq', '.github-cache.json');
  }

  it('exits gracefully when input() throws ExitPromptError (non-TTY)', async () => {
    const exitError = new Error('User force closed the prompt');
    exitError.name = 'ExitPromptError';
    mockInput.mockRejectedValueOnce(exitError);

    // Mock GitHub device flow: code request -> token poll -> user info
    // signup.ts calls fetch directly for GitHub APIs (not via SDK),
    // so these still use the Request object pattern
    mockFetch
      .mockResolvedValueOnce(
        createMockResponse(200, {
          device_code: 'dc-123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://github.com/login/device',
          interval: 0,
        })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { access_token: 'gh-token-123' })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { login: 'testuser', id: 1 })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup([], config);

    await expect(cmd.run()).rejects.toThrow(/EEXIT: 1/);
  });

  it('re-throws non-ExitPromptError errors from input()', async () => {
    const randomError = new Error('Something else broke');
    mockInput.mockRejectedValueOnce(randomError);

    mockFetch
      .mockResolvedValueOnce(
        createMockResponse(200, {
          device_code: 'dc-123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://github.com/login/device',
          interval: 0,
        })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { access_token: 'gh-token-123' })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { login: 'testuser', id: 1 })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup([], config);

    await expect(cmd.run()).rejects.toThrow('Something else broke');
  });

  it('uses cached GitHub token on retry instead of device flow', async () => {
    // Pre-seed the cache
    await fs.mkdir(path.join(tempDir, '.linq'), { recursive: true });
    await fs.writeFile(
      cachePath(),
      JSON.stringify({ token: 'cached-gh-token', login: 'cacheduser' })
    );

    // First fetch: validate cached token via GET /user
    // Second fetch: sandbox create (we'll let it fail to keep the test short)
    mockFetch
      .mockResolvedValueOnce(
        createMockResponse(200, { login: 'cacheduser', id: 42 })
      )
      .mockResolvedValueOnce(
        createMockResponse(500, { message: 'Internal error' })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(['--phone', '+11234567890'], config);

    await expect(cmd.run()).rejects.toThrow(/EEXIT: 1/);

    // Should have validated the cached token, NOT started device flow
    // Device flow calls POST github.com/login/device/code -- our mock only
    // received GET /user and POST /sandbox/create
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [firstUrl] = mockFetch.mock.calls[0];
    expect(firstUrl).toBe('https://api.github.com/user');
  });

  it('clears cache and starts device flow when cached token is invalid', async () => {
    // Pre-seed the cache with an expired/revoked token
    await fs.mkdir(path.join(tempDir, '.linq'), { recursive: true });
    await fs.writeFile(
      cachePath(),
      JSON.stringify({ token: 'expired-token', login: 'olduser' })
    );

    // First fetch: validate cached token -> 401 (invalid)
    // Then device flow: code request -> token poll -> user info
    // Then sandbox create (fail to keep test short)
    mockFetch
      .mockResolvedValueOnce(createMockResponse(401, { message: 'Bad credentials' }))
      .mockResolvedValueOnce(
        createMockResponse(200, {
          device_code: 'dc-456',
          user_code: 'WXYZ-5678',
          verification_uri: 'https://github.com/login/device',
          interval: 0,
        })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { access_token: 'new-gh-token' })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { login: 'newuser', id: 99 })
      )
      .mockResolvedValueOnce(
        createMockResponse(500, { message: 'Internal error' })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(['--phone', '+11234567890'], config);

    await expect(cmd.run()).rejects.toThrow(/EEXIT: 1/);

    // Cache should have been cleared and re-written with new token
    const cacheData = JSON.parse(await fs.readFile(cachePath(), 'utf-8'));
    expect(cacheData.token).toBe('new-gh-token');
    expect(cacheData.login).toBe('newuser');
  });

  it('caches GitHub token after successful device flow auth', async () => {
    // Device flow: code request -> token poll -> user info -> sandbox fail
    mockFetch
      .mockResolvedValueOnce(
        createMockResponse(200, {
          device_code: 'dc-789',
          user_code: 'TEST-CODE',
          verification_uri: 'https://github.com/login/device',
          interval: 0,
        })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { access_token: 'fresh-token' })
      )
      .mockResolvedValueOnce(
        createMockResponse(200, { login: 'freshuser', id: 7 })
      )
      .mockResolvedValueOnce(
        createMockResponse(500, { message: 'Server error' })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(['--phone', '+11234567890'], config);

    await expect(cmd.run()).rejects.toThrow(/EEXIT: 1/);

    // Token should have been cached
    const cacheData = JSON.parse(await fs.readFile(cachePath(), 'utf-8'));
    expect(cacheData.token).toBe('fresh-token');
    expect(cacheData.login).toBe('freshuser');
  });
});
