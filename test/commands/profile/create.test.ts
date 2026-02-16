import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ProfileCreate from '../../../src/commands/profile/create.js';

describe('profile create', () => {
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

  function configPath() {
    return path.join(tempDir, '.linq', 'config.json');
  }

  it('creates a new empty profile', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileCreate(['work'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.work).toBeDefined();
  });

  it('creates a profile with token and phone', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileCreate(['staging', '--token', 'tok-123', '--from-phone', '+11111111111'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.staging.token).toBe('tok-123');
    expect(savedConfig.profiles.staging.fromPhone).toBe('+11111111111');
  });

  it('blocks creating sandbox profile', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileCreate(['sandbox'], config);

    await expect(cmd.run()).rejects.toThrow(/reserved for/);
  });

  it('errors if profile already exists', async () => {
    const config = await Config.load({ root: process.cwd() });

    // Create once
    const cmd1 = new ProfileCreate(['work'], config);
    await cmd1.run();

    // Try to create again
    const cmd2 = new ProfileCreate(['work'], config);
    await expect(cmd2.run()).rejects.toThrow(/already exists/);
  });
});
