import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesList from '../../../src/commands/messages/list.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('messages list', () => {
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

  it('lists messages in a chat', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        messages: [
          {
            id: 'msg-123',
            chat_id: 'chat-123',
            created_at: '2024-01-15T10:30:00Z',
            from: '+19876543210',
            is_delivered: true,
            is_from_me: false,
            is_read: false,
            updated_at: '2024-01-15T10:30:00Z',
            sent_at: '2024-01-15T10:30:00Z',
            parts: [{ type: 'text', value: 'Hello!', reactions: null }],
          },
          {
            id: 'msg-456',
            chat_id: 'chat-123',
            created_at: '2024-01-15T10:31:00Z',
            from: '+12025551234',
            is_delivered: true,
            is_from_me: true,
            is_read: true,
            updated_at: '2024-01-15T10:31:00Z',
            sent_at: '2024-01-15T10:31:00Z',
            parts: [{ type: 'text', value: 'Hi there!', reactions: null }],
          },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesList(['chat-123'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/v3/chats/chat-123/messages');
  });

  it('handles pagination parameters', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        messages: [],
        next_cursor: 'next-page',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesList(
      ['chat-123', '--limit', '50', '--cursor', 'prev-cursor'],
      config
    );
    await cmd.run();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('limit=50');
    expect(url).toContain('cursor=prev-cursor');
  });

  it('requires chat ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesList([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
