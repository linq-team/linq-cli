import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockSelect = vi.fn();
const mockInput = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  password: vi.fn(),
  select: (...args: unknown[]) => mockSelect(...args),
  input: (...args: unknown[]) => mockInput(...args),
}));

const { default: Login } = await import('../../src/commands/login.js');

describe('login', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
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

  it('saves token when provided via flag', async () => {
    mockSelect.mockResolvedValueOnce('default');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'test-token-123'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.default.token).toBe('test-token-123');
  });

  it('creates config directory with correct permissions', async () => {
    mockSelect.mockResolvedValueOnce('default');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'test-token'], config);
    await cmd.run();

    const configDir = path.join(tempDir, '.linq');
    const stats = await fs.stat(configDir);
    // 0o700 = rwx------
    expect(stats.mode & 0o777).toBe(0o700);
  });

  it('saves to a specific profile with --profile flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'work-token', '--profile', 'work'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.work.token).toBe('work-token');
    expect(savedConfig.profile).toBe('work');
  });

  it('blocks --profile sandbox', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'tok', '--profile', 'sandbox'], config);

    await expect(cmd.run()).rejects.toThrow(/reserved for/);
  });
});
