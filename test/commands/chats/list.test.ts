import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ChatsList from '../../../src/commands/chats/list.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('chats list', () => {
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
      JSON.stringify({ profile: 'default', profiles: { default: { token: 'test-token' } } })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('lists chats successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        chats: [
          {
            id: 'chat-123',
            handles: [{ handle: '+19876543210', service: 'iMessage' }],
            service: 'iMessage',
          },
          {
            id: 'chat-456',
            handles: [{ handle: '+15555555555', service: 'SMS' }],
            service: 'SMS',
          },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsList(['--from', '+12025551234'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toContain('/v3/chats');
    expect(request.url).toContain('from=%2B12025551234');
  });

  it('handles pagination cursor', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        chats: [{ id: 'chat-789', handles: [{ handle: '+11111111111', service: 'iMessage' }] }],
        next_cursor: 'next-page-cursor',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsList(['--from', '+12025551234', '--cursor', 'prev-cursor'], config);
    await cmd.run();

    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toContain('cursor=prev-cursor');
  });

  it('requires from flag or config fromPhone', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsList([], config);

    await expect(cmd.run()).rejects.toThrow('No sender phone found');
  });
});
