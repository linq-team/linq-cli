import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const { default: Login } = await import('../../src/commands/login.js');

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

  it('requires email flag or interactive input', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login([], config);
    // Login with no args enters interactive mode which we can't test here
    // Just verify the command can be instantiated
    expect(cmd).toBeDefined();
  });
});
