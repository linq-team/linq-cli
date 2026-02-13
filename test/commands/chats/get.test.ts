import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ChatsGet from '../../../src/commands/chats/get.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockHandle = (phone: string) => ({
  id: 'h-1',
  handle: phone,
  service: 'iMessage',
  status: 'active',
  joined_at: '2024-01-15T00:00:00Z',
});

describe('chats get', () => {
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

  it('gets chat by ID successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        id: 'chat-123',
        display_name: 'Test Chat',
        is_group: false,
        is_archived: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        handles: [
          mockHandle('+19876543210'),
          mockHandle('+15555555555'),
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsGet(['chat-123'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/chats/chat-123');
    expect(request.method).toBe('GET');
  });

  it('requires chat ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsGet([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
