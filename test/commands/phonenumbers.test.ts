import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import PhoneNumbers from '../../src/commands/phonenumbers.js';

// Mock the fetch globally with proper Response object
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('phonenumbers', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();

    // Create config with token
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

  it('calls API with correct endpoint', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        phone_numbers: [
          {
            id: '123',
            phone_number: '+12025551234',
            type: 'APPLE_ID',
            country_code: 'US',
            capabilities: { sms: true, mms: true, voice: false },
          },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new PhoneNumbers([], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.linqapp.com/api/partner/v3/phonenumbers'
    );
  });

  it('requires authentication', async () => {
    // Remove config file
    await fs.rm(path.join(tempDir, '.linq', 'config.json'));

    const config = await Config.load({ root: process.cwd() });
    const cmd = new PhoneNumbers([], config);

    await expect(cmd.run()).rejects.toThrow('No token found');
  });
});
