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

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { default: Login } = await import('../../src/commands/login.js');

describe('login (token paste)', () => {
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

  it('--token: validates, fetches account-info, saves full profile', async () => {
    // Call order in login.ts:
    //   1. client.phoneNumbers.list()           — synapse
    //   2. fetch /cli/account-info              — zero-service
    //   3. fetchPartnerId(token)                — webhook svc
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, {
        phone_numbers: [{ id: 'pn-1', phone_number: '+18005551234' }],
      }))
      .mockResolvedValueOnce(jsonResponse(200, {
        partnerId: 'partner-1',
        orgId: '999',
        name: 'Acme',
        accountInfo: {
          tier: 0,
          phones: [{ phoneNumber: '+18005551234', tenantType: 'MULTI' }],
        },
      }))
      .mockResolvedValueOnce(jsonResponse(200, { partnerId: 'partner-1' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'linq_test_token', '--profile', 'default'], config);
    await cmd.run();

    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.token).toBe('linq_test_token');
    expect(saved.profiles.default.fromPhone).toBe('+18005551234');
    expect(saved.profiles.default.orgId).toBe('999');
    expect(saved.profiles.default.tier).toBe(0);
    expect(saved.profiles.default.tenantType).toBe('MULTI');
    expect(saved.profiles.default.name).toBe('Acme');
    expect(saved.profile).toBe('default');
  });

  it('--token: invalid token errors out', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(401, { message: 'Unauthorized' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'bad-token', '--profile', 'default'], config);

    await expect(cmd.run()).rejects.toThrow(/Invalid token|API error/);
  });

  it('shared-line user with multiple phones auto-picks first (no prompt)', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, {
        phone_numbers: [
          { id: 'pn-1', phone_number: '+18005551111' },
          { id: 'pn-2', phone_number: '+18005552222' },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse(200, {
        partnerId: 'partner-1',
        orgId: '999',
        name: 'Acme',
        accountInfo: {
          tier: 0,
          phones: [
            { phoneNumber: '+18005551111', tenantType: 'MULTI' },
            { phoneNumber: '+18005552222', tenantType: 'MULTI' },
          ],
        },
      }))
      .mockResolvedValueOnce(jsonResponse(200, { partnerId: 'partner-1' }));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'linq_test', '--profile', 'default'], config);
    await cmd.run();

    expect(mockSelect).not.toHaveBeenCalled();
    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.fromPhone).toBe('+18005551111');
  });

  it('paid user with multiple phones is prompted', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, {
        phone_numbers: [
          { id: 'pn-1', phone_number: '+18005551111' },
          { id: 'pn-2', phone_number: '+18005552222' },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse(200, {
        partnerId: 'partner-1',
        orgId: '999',
        name: 'Acme',
        accountInfo: {
          tier: 1,
          phones: [
            { phoneNumber: '+18005551111', tenantType: 'SINGLE' },
            { phoneNumber: '+18005552222', tenantType: 'SINGLE' },
          ],
        },
      }))
      .mockResolvedValueOnce(jsonResponse(200, { partnerId: 'partner-1' }));

    mockSelect.mockResolvedValueOnce('+18005552222');

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Login(['--token', 'linq_test', '--profile', 'default'], config);
    await cmd.run();

    expect(mockSelect).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(await fs.readFile(configPath(), 'utf-8'));
    expect(saved.profiles.default.fromPhone).toBe('+18005552222');
    expect(saved.profiles.default.tier).toBe(1);
  });
});
