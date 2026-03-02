import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createDynamicClient', () => {
  let tempDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();

    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: { default: { token: 'token-aaa' } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    delete process.env.LINQ_TOKEN;
    delete process.env.LINQ_PROFILE;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('reads token from active profile', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, { phone_numbers: [] })
    );

    const { createDynamicClient } = await import('../../src/lib/api-client.js');
    const client = createDynamicClient();
    await client.phoneNumbers.list();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get('authorization')).toContain('token-aaa');
  });

  it('picks up profile switch without restart', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(createMockResponse(200, { phone_numbers: [] }))
    );

    const { createDynamicClient } = await import('../../src/lib/api-client.js');
    const client = createDynamicClient();

    // First call uses token-aaa
    await client.phoneNumbers.list();
    const [, init1] = mockFetch.mock.calls[0];
    expect(init1.headers.get('authorization')).toContain('token-aaa');

    // Switch profile by rewriting config
    await fs.writeFile(
      path.join(tempDir, '.linq', 'config.json'),
      JSON.stringify({
        profile: 'work',
        profiles: {
          default: { token: 'token-aaa' },
          work: { token: 'token-bbb' },
        },
      })
    );

    // Second call uses token-bbb
    await client.phoneNumbers.list();
    const [, init2] = mockFetch.mock.calls[1];
    expect(init2.headers.get('authorization')).toContain('token-bbb');
  });

  it('throws when active profile has no token', async () => {
    await fs.writeFile(
      path.join(tempDir, '.linq', 'config.json'),
      JSON.stringify({
        profile: 'empty',
        profiles: { empty: {} },
      })
    );

    const { createDynamicClient } = await import('../../src/lib/api-client.js');
    const client = createDynamicClient();

    expect(() => client.phoneNumbers).toThrow('No token for active profile "empty"');
  });

  it('respects LINQ_TOKEN env var override', async () => {
    process.env.LINQ_TOKEN = 'env-token';
    mockFetch.mockResolvedValue(
      createMockResponse(200, { phone_numbers: [] })
    );

    const { createDynamicClient } = await import('../../src/lib/api-client.js');
    const client = createDynamicClient();
    await client.phoneNumbers.list();

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get('authorization')).toContain('env-token');
  });

  it('respects LINQ_PROFILE env var override', async () => {
    await fs.writeFile(
      path.join(tempDir, '.linq', 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: {
          default: { token: 'token-aaa' },
          staging: { token: 'token-staging' },
        },
      })
    );
    process.env.LINQ_PROFILE = 'staging';
    mockFetch.mockResolvedValue(
      createMockResponse(200, { phone_numbers: [] })
    );

    const { createDynamicClient } = await import('../../src/lib/api-client.js');
    const client = createDynamicClient();
    await client.phoneNumbers.list();

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get('authorization')).toContain('token-staging');
  });
});
