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

const { default: Signup } = await import('../../src/commands/signup.js');

describe('signup (email OTP flow)', () => {
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

  it('happy path: new user → send-otp → verify-code → signup → profile saved', async () => {
    // Inputs: OTP code, then name (in that order — verify-code prompts code first, name only if new)
    mockInput
      .mockResolvedValueOnce('123456') // OTP code
      .mockResolvedValueOnce('Test User'); // name

    mockFetch
      // send-otp
      .mockResolvedValueOnce(jsonResponse(200, { sessionId: 'sess-1' }))
      // verify-code → new user, returns signupToken
      .mockResolvedValueOnce(
        jsonResponse(200, {
          needsSignup: true,
          signupToken: 'sgn-tok-1',
          email: 'new@example.com',
        })
      )
      // signup → provisioned, returns auth token + accountInfo
      .mockResolvedValueOnce(
        jsonResponse(201, {
          token: 'api-token-xyz',
          orgId: '1234',
          email: 'new@example.com',
          name: 'Test User',
          accountInfo: {
            accountLabel: 'Shared',
            phones: [{ phoneNumber: '+12025551234' }],
          },
        })
      );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(['--email', 'new@example.com'], config);
    await cmd.run();

    // Verify the right endpoints were hit
    const calls = mockFetch.mock.calls.map((c) => c[0]);
    expect(calls.some((u: string) => u.endsWith('/cli/send-otp'))).toBe(true);
    expect(calls.some((u: string) => u.endsWith('/cli/verify-code'))).toBe(true);
    expect(calls.some((u: string) => u.endsWith('/cli/signup'))).toBe(true);

    // Verify profile saved with the auth token
    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe('api-token-xyz');
    expect(saved.profiles.default.email).toBe('new@example.com');
    expect(saved.profiles.default.fromPhone).toBe('+12025551234');
    expect(saved.profiles.default.accountLabel).toBe('Shared');
  });

  it('refuses to run if already logged in', async () => {
    // Pre-seed an active session
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
    const cmd = new Signup(['--email', 'other@example.com'], config);
    await cmd.run();

    // No network calls — bailed early
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('exits when send-otp is rate-limited', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(400, { message: 'Too many verification codes requested. Please try again later.' })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(['--email', 'new@example.com'], config);
    await expect(cmd.run()).rejects.toThrow(/EEXIT: 1/);

    // Should never have prompted for a code
    expect(mockInput).not.toHaveBeenCalled();
  });

  // --ref carries the visitor's linqapp.com PostHog id across the gap between
  // the browser and the terminal. It arrives pre-filled in the quickstart
  // copied from the CLI page and is forwarded verbatim to /cli/signup, where
  // the backend aliases the anonymous site history onto the new account.
  function signupBody() {
    const call = mockFetch.mock.calls.find((c) =>
      (c[0] as string).endsWith('/cli/signup')
    );
    return JSON.parse((call![1] as RequestInit).body as string);
  }

  // Both --ref tests run fully non-interactively (--email --code --name),
  // which skips send-otp entirely: re-sending would mint a fresh OTP and
  // invalidate the code being verified. So only verify-code and signup are
  // mocked here.
  function mockNonInteractiveSignupFlow() {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse(200, {
          needsSignup: true,
          signupToken: 'sgn-tok-1',
          email: 'new@example.com',
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(201, {
          token: 'api-token-xyz',
          orgId: '1234',
          email: 'new@example.com',
          name: 'Test User',
          accountInfo: {
            accountLabel: 'Shared',
            phones: [{ phoneNumber: '+12025551234' }],
          },
        })
      );
  }

  it('forwards --ref to /cli/signup as webDistinctId', async () => {
    mockNonInteractiveSignupFlow();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(
      [
        '--email',
        'new@example.com',
        '--code',
        '123456',
        '--name',
        'Test User',
        '--ref',
        '0198f2a1-dead-beef-cafe-000000000000~1780000000',
      ],
      config
    );
    await cmd.run();

    expect(signupBody().webDistinctId).toBe(
      '0198f2a1-dead-beef-cafe-000000000000~1780000000'
    );
  });

  it('omits webDistinctId entirely when --ref is absent', async () => {
    mockNonInteractiveSignupFlow();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Signup(
      ['--email', 'new@example.com', '--code', '123456', '--name', 'Test User'],
      config
    );
    await cmd.run();

    // Absent, not null/empty — the payload must be byte-identical to what
    // pre-2.6.0 clients send for anyone who did not arrive via the quickstart.
    expect('webDistinctId' in signupBody()).toBe(false);
  });
});
