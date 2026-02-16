import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { saveSandboxProfile, saveProfile } from '../../../src/lib/config.js';

const mockConfirm = vi.fn();

vi.mock('@inquirer/prompts', () => ({
  confirm: (...args: unknown[]) => mockConfirm(...args),
}));

const { default: ProfileDelete } = await import('../../../src/commands/profile/delete.js');

describe('profile delete', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockConfirm.mockReset();
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function configPath() {
    return path.join(tempDir, '.linq', 'config.json');
  }

  it('deletes a named profile', async () => {
    await saveProfile('work', { token: 'tok' });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileDelete(['work'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.work).toBeUndefined();
  });

  it('errors when deleting default', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileDelete(['default'], config);

    await expect(cmd.run()).rejects.toThrow(/Cannot delete the default/);
  });

  it('confirms before deleting sandbox profile', async () => {
    await saveSandboxProfile({
      token: 'tok',
      fromPhone: '+14043848368',
      expiresAt: '2026-02-16T05:12:53.715Z',
      githubLogin: 'testuser',
    });
    mockConfirm.mockResolvedValueOnce(true);

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileDelete(['sandbox'], config);
    await cmd.run();

    expect(mockConfirm).toHaveBeenCalledOnce();
    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.sandbox).toBeUndefined();
  });

  it('aborts sandbox deletion when user declines', async () => {
    await saveSandboxProfile({
      token: 'tok',
      fromPhone: '+14043848368',
      expiresAt: '2026-02-16T05:12:53.715Z',
      githubLogin: 'testuser',
    });
    mockConfirm.mockResolvedValueOnce(false);

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileDelete(['sandbox'], config);
    await cmd.run();

    const savedConfig = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(savedConfig.profiles.sandbox).toBeDefined();
  });
});
