import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ProfileList from '../../../src/commands/profile/list.js';
import { saveProfile, saveSandboxProfile, setCurrentProfile } from '../../../src/lib/config.js';

describe('profile list', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let logs: string[];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    logs = [];
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function captureOutput(cmd: ProfileList): void {
    cmd.log = (...args: string[]) => {
      logs.push(args.join(' '));
    };
  }

  it('lists profiles with active marker', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileList([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('default (active)');
  });

  it('lists multiple profiles with phone numbers', async () => {
    await saveProfile('work', { token: 'tok', fromPhone: '+12025551234' });
    await setCurrentProfile('work');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileList([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('default');
    expect(output).toContain('work (active, +12025551234)');
  });

  it('shows sandbox expired status', async () => {
    await saveSandboxProfile({
      token: 'tok',
      fromPhone: '+14043848368',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      githubLogin: 'testuser',
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileList([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('expired');
  });

  it('shows sandbox active status with phone', async () => {
    await saveSandboxProfile({
      token: 'tok',
      fromPhone: '+14043848368',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      githubLogin: 'testuser',
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ProfileList([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('+14043848368');
    expect(output).toContain('expires');
  });
});
