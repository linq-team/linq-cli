import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockPassword = vi.fn();
const mockSelect = vi.fn();
const mockInput = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  password: (...args: unknown[]) => mockPassword(...args),
  select: (...args: unknown[]) => mockSelect(...args),
  input: (...args: unknown[]) => mockInput(...args),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Import after mocks are set up
const { default: Init } = await import('../../src/commands/init.js');

describe('init', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    mockPassword.mockReset();
    mockSelect.mockReset();
    mockInput.mockReset();
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function configPath() {
    return path.join(tempDir, '.linq', 'config.json');
  }

  it('completes full setup with single phone number', async () => {
    mockSelect.mockResolvedValueOnce('default'); // profile selection
    mockPassword.mockResolvedValueOnce('test-token-123');

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, { phone_numbers: [{ phone_number: '+12025551234' }] })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Init([], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.default.token).toBe('test-token-123');
    expect(savedConfig.profiles.default.fromPhone).toBe('+12025551234');
  });

  it('prompts for phone selection with multiple numbers', async () => {
    mockSelect.mockResolvedValueOnce('default'); // profile selection
    mockPassword.mockResolvedValueOnce('test-token-123');
    mockSelect.mockResolvedValueOnce('+18005551234'); // phone selection

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        phone_numbers: [
          { phone_number: '+12025551234' },
          { phone_number: '+18005551234' },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Init([], config);
    await cmd.run();

    expect(mockSelect).toHaveBeenCalledTimes(2); // profile selection + phone selection

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.default.fromPhone).toBe('+18005551234');
  });

  it('errors on invalid token', async () => {
    mockSelect.mockResolvedValueOnce('default'); // profile selection
    mockPassword.mockResolvedValueOnce('bad-token');

    mockFetch.mockResolvedValueOnce(
      createMockResponse(401, { error: 'Unauthorized' })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Init([], config);

    await expect(cmd.run()).rejects.toThrow();
  });

  it('saves to a specific profile with --profile flag', async () => {
    mockPassword.mockResolvedValueOnce('work-token');

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, { phone_numbers: [{ phone_number: '+18005551234' }] })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Init(['--profile', 'work'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.work.token).toBe('work-token');
    expect(savedConfig.profile).toBe('work');
  });

  it('blocks --profile sandbox', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Init(['--profile', 'sandbox'], config);

    await expect(cmd.run()).rejects.toThrow(/reserved for/);
  });
});
