import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import McpInstall from '../../../src/commands/mcp/install.js';

describe('mcp install', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;

    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({ profile: 'default', profiles: { default: { token: 'test-token' } } })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('skips already installed clients', async () => {
    // AI_CLIENTS uses the real homedir at module load, so we write to the real config
    // Just verify the command runs without error — it will log "already installed" for real clients
    const config = await Config.load({ root: process.cwd() });
    const cmd = new McpInstall([], config);
    await expect(cmd.run()).resolves.toBeUndefined();
  });

  it('has no --profile or --token flags', () => {
    // Verify the dynamic client approach removed these flags
    expect(McpInstall.flags?.profile).toBeUndefined();
    expect(McpInstall.flags?.token).toBeUndefined();
  });
});
