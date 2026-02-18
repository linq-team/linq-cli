import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ChatsVoicememo from '../../../src/commands/chats/voicememo.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('chats voicememo', () => {
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
        profiles: { default: { token: 'test-token', fromPhone: '+12025551234' } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('sends voice memo to chat', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(202, {
        voice_memo: {
          id: 'vm-123',
          chat: {
            id: 'chat-123',
            handles: [{ id: 'h-1', handle: '+19876543210', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' }],
            is_active: true,
            is_group: false,
            service: 'iMessage',
          },
          created_at: '2024-01-15T10:00:00Z',
          from: '+12025551234',
          status: 'queued',
          to: ['+19876543210'],
          voice_memo: {
            id: 'file-123',
            filename: 'memo.m4a',
            mime_type: 'audio/mp4',
            size_bytes: 50000,
            url: 'https://example.com/memo.m4a',
          },
        },
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsVoicememo(
      ['chat-123', '--url', 'https://example.com/memo.m4a'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.linqapp.com/api/partner/v3/chats/chat-123/voicememo'
    );
    expect((init as RequestInit).method).toBe('POST');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.voice_memo_url).toBe('https://example.com/memo.m4a');
    expect(body.from).toBe('+12025551234');
  });

  it('requires url flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsVoicememo(['chat-123'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag');
  });
});
