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

});
