import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import Login from '../../src/commands/login.js';

describe('login', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('saves token when provided via flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'test-token-123'], config);
    await cmd.run();

    const configPath = path.join(tempDir, '.linq', 'config.json');
    const savedConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    expect(savedConfig.profiles.default.token).toBe('test-token-123');
  });

  it('creates config directory with correct permissions', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'test-token'], config);
    await cmd.run();

    const configDir = path.join(tempDir, '.linq');
    const stats = await fs.stat(configDir);
    // 0o700 = rwx------
    expect(stats.mode & 0o777).toBe(0o700);
  });
});
