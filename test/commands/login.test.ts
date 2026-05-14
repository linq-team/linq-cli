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

const { default: Login } = await import('../../src/commands/login.js');

describe('login (email OTP flow)', () => {
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

  function configPath() {
    return path.join(tempDir, '.linq', 'config.json');
  }

  it('happy path: existing user → send-otp → verify-code returns token → profile saved', async () => {
    mockInput.mockResolvedValueOnce('123456'); // OTP code

    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, { sessionId: 'sess-1' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          needsSignup: false,
          token: 'returning-user-token',
          orgId: '999',
          email: 'me@example.com',
          name: 'Me',
          accountInfo: {
            tier: 0,
            phones: [{ phoneNumber: '+18005551234', tenantType: 'MULTI' }],
          },
        })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--email', 'me@example.com'], config);
    await cmd.run();

    // Should NOT have called /cli/signup — user already exists
    const calls = mockFetch.mock.calls.map((c) => c[0]);
    expect(calls.some((u: string) => u.endsWith('/cli/signup'))).toBe(false);

    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe('returning-user-token');
    expect(saved.profiles.default.email).toBe('me@example.com');
  });

  it('reprompts on invalid OTP, then succeeds on second attempt', async () => {
    mockInput
      .mockResolvedValueOnce('000000') // wrong code
      .mockResolvedValueOnce('123456'); // right code

    mockFetch
      // send-otp
      .mockResolvedValueOnce(jsonResponse(200, { sessionId: 'sess-1' }))
      // first verify-code: bad OTP
      .mockResolvedValueOnce(
        jsonResponse(400, { message: 'Invalid verification code.' })
      )
      // second verify-code: success
      .mockResolvedValueOnce(
        jsonResponse(200, {
          needsSignup: false,
          token: 'after-retry-token',
          orgId: '1',
          email: 'me@example.com',
          name: 'Me',
          accountInfo: {
            tier: 0,
            phones: [{ phoneNumber: '+18005551234', tenantType: 'MULTI' }],
          },
        })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--email', 'me@example.com'], config);
    await cmd.run();

    // Both OTPs were consumed
    expect(mockInput).toHaveBeenCalledTimes(2);

    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe('after-retry-token');
  });

  it('refuses to run if already logged in', async () => {
    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: {
          default: {
            token: 'existing-token',
            email: 'me@example.com',
            sessionExpiresAt: future,
          },
        },
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--email', 'other@example.com'], config);
    await cmd.run();

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
