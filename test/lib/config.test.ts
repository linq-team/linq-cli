import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  loadConfigFile,
  saveConfigFile,
  saveProfile,
  deleteProfile,
  getSandboxProfile,
  isSandboxExpired,
  saveSandboxProfile,
  SANDBOX_PROFILE,
  type ConfigFile,
} from '../../src/lib/config.js';

describe('config', () => {
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

  async function writeConfig(config: Record<string, unknown>) {
    const dir = path.join(tempDir, '.linq');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'config.json'), JSON.stringify(config));
  }

  async function readConfig(): Promise<ConfigFile> {
    return JSON.parse(await fs.readFile(configPath(), 'utf-8'));
  }

  describe('migration', () => {
    it('migrates v1 config with embedded sandbox to v2', async () => {
      await writeConfig({
        profile: 'default',
        profiles: {
          default: {
            token: 'sandbox-token',
            fromPhone: '+14043848368',
            partnerId: 'p-123',
            sandbox: {
              phone: '+14043848368',
              userPhone: '+12054411188',
              expiresAt: '2026-02-16T05:12:53.715Z',
              githubLogin: 'testuser',
            },
          },
        },
      });

      const result = await loadConfigFile();

      expect(result.version).toBe(2);
      expect(result.profiles.sandbox.fromPhone).toBe('+14043848368');
      expect(result.profiles.sandbox.expiresAt).toBe('2026-02-16T05:12:53.715Z');
      expect(result.profiles.sandbox.githubLogin).toBe('testuser');
      expect(result.profiles.sandbox.token).toBe('sandbox-token');
      // Original profile cleared (fromPhone matched sandbox phone)
      expect(result.profiles.default.token).toBeUndefined();
      expect(result.profiles.default.fromPhone).toBeUndefined();
      // No legacy fields
      expect(result.sandbox).toBeUndefined();
      expect((result.profiles.sandbox as Record<string, unknown>).phone).toBeUndefined();
      expect((result.profiles.sandbox as Record<string, unknown>).userPhone).toBeUndefined();
    });

    it('migrates root-level sandbox into sandbox profile', async () => {
      await writeConfig({
        version: 2,
        profile: 'sandbox',
        profiles: {
          default: {},
          sandbox: { token: 'tok', fromPhone: '+14043848368' },
        },
        sandbox: {
          phone: '+14043848368',
          userPhone: '+12054411188',
          expiresAt: '2026-02-16T05:12:53.715Z',
          githubLogin: 'testuser',
        },
      });

      const result = await loadConfigFile();

      expect(result.sandbox).toBeUndefined();
      expect(result.profiles.sandbox.fromPhone).toBe('+14043848368');
      expect(result.profiles.sandbox.expiresAt).toBe('2026-02-16T05:12:53.715Z');
      expect(result.profiles.sandbox.githubLogin).toBe('testuser');
    });

    it('skips migration for clean v2 configs', async () => {
      await writeConfig({
        version: 2,
        profile: 'default',
        profiles: {
          default: { token: 'my-token' },
        },
      });

      const result = await loadConfigFile();

      expect(result.version).toBe(2);
      expect(result.profiles.default.token).toBe('my-token');
    });

    it('persists migrated config to disk', async () => {
      await writeConfig({
        profile: 'default',
        profiles: {
          default: {
            token: 'tok',
            fromPhone: '+14043848368',
            sandbox: {
              phone: '+14043848368',
              userPhone: '+12054411188',
              expiresAt: '2026-02-16T05:12:53.715Z',
              githubLogin: 'testuser',
            },
          },
        },
      });

      await loadConfigFile();

      const raw = await readConfig();
      expect(raw.version).toBe(2);
      expect(raw.profiles.sandbox.fromPhone).toBe('+14043848368');
      expect(raw.profiles.sandbox.expiresAt).toBeDefined();
      expect(raw.sandbox).toBeUndefined();
    });
  });

  describe('saveProfile', () => {
    it('blocks saving to sandbox profile', async () => {
      await expect(
        saveProfile(SANDBOX_PROFILE, { token: 'tok' })
      ).rejects.toThrow(/reserved for/);
    });

    it('saves to a named profile', async () => {
      await saveProfile('work', { token: 'work-token' });

      const config = await readConfig();
      expect(config.profiles.work.token).toBe('work-token');
    });

    it('merges with existing profile data', async () => {
      await saveProfile('work', { token: 'tok' });
      await saveProfile('work', { fromPhone: '+11111111111' });

      const config = await readConfig();
      expect(config.profiles.work.token).toBe('tok');
      expect(config.profiles.work.fromPhone).toBe('+11111111111');
    });
  });

  describe('deleteProfile', () => {
    it('deletes a profile', async () => {
      await saveProfile('work', { token: 'tok' });
      await deleteProfile('work');

      const config = await readConfig();
      expect(config.profiles.work).toBeUndefined();
    });

    it('throws when deleting default', async () => {
      await expect(deleteProfile('default')).rejects.toThrow(/Cannot delete the default/);
    });

    it('throws when profile not found', async () => {
      await expect(deleteProfile('nonexistent')).rejects.toThrow(/not found/);
    });

    it('deletes sandbox profile', async () => {
      await saveSandboxProfile({
        token: 'tok',
        fromPhone: '+14043848368',
        expiresAt: '2026-02-16T05:12:53.715Z',
        githubLogin: 'testuser',
      });
      await deleteProfile(SANDBOX_PROFILE);

      const config = await readConfig();
      expect(config.profiles.sandbox).toBeUndefined();
    });

    it('switches to default when deleting active profile', async () => {
      await saveProfile('work', { token: 'tok' });
      const config = await loadConfigFile();
      config.profile = 'work';
      await saveConfigFile(config);

      await deleteProfile('work');

      const updated = await readConfig();
      expect(updated.profile).toBe('default');
    });
  });

  describe('sandbox functions', () => {
    it('saveSandboxProfile saves all fields', async () => {
      await saveSandboxProfile({
        token: 'sb-token',
        fromPhone: '+14043848368',
        partnerId: 'p-1',
        expiresAt: '2026-02-16T05:12:53.715Z',
        githubLogin: 'testuser',
      });

      const config = await readConfig();
      expect(config.profiles.sandbox.token).toBe('sb-token');
      expect(config.profiles.sandbox.fromPhone).toBe('+14043848368');
      expect(config.profiles.sandbox.partnerId).toBe('p-1');
      expect(config.profiles.sandbox.expiresAt).toBe('2026-02-16T05:12:53.715Z');
      expect(config.profiles.sandbox.githubLogin).toBe('testuser');
    });

    it('getSandboxProfile returns profile when present', async () => {
      await saveSandboxProfile({
        token: 'tok',
        fromPhone: '+14043848368',
        expiresAt: '2026-02-16T05:12:53.715Z',
        githubLogin: 'testuser',
      });

      const result = await getSandboxProfile();
      expect(result?.fromPhone).toBe('+14043848368');
      expect(result?.expiresAt).toBe('2026-02-16T05:12:53.715Z');
      expect(result?.githubLogin).toBe('testuser');
    });

    it('getSandboxProfile returns undefined when no sandbox', async () => {
      const result = await getSandboxProfile();
      expect(result).toBeUndefined();
    });

    it('isSandboxExpired returns false for future date', () => {
      expect(isSandboxExpired({
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      })).toBe(false);
    });

    it('isSandboxExpired returns true for past date', () => {
      expect(isSandboxExpired({
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      })).toBe(true);
    });
  });
});
