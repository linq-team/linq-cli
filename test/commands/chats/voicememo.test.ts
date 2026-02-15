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

const mockHandle = {
  id: 'h-1',
  handle: '+12025551234',
  service: 'iMessage',
  status: 'active',
  joined_at: '2024-01-15T00:00:00Z',
};

function voiceMemoResponse() {
  return {
    voice_memo: {
      id: 'vm-123',
      from: '+12025551234',
      to: ['+19876543210'],
      status: 'sent',
      service: 'iMessage',
      voice_memo: {
        id: 'att-123',
        url: 'https://example.com/memo.m4a',
        filename: 'memo.m4a',
        mime_type: 'audio/m4a',
        size_bytes: 1024,
      },
      created_at: '2024-01-15T00:00:00Z',
      chat: {
        id: 'chat-123',
        handles: [mockHandle],
        is_group: false,
        service: 'iMessage',
        is_active: true,
      },
    },
  };
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
    mockFetch.mockResolvedValueOnce(
      createMockResponse(202, voiceMemoResponse())
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsVoicememo(
      ['chat-123', '--url', 'https://example.com/memo.m4a'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe(
      'https://api.linqapp.com/api/partner/v3/chats/chat-123/voicememo'
    );
    expect(request.method).toBe('POST');
    const body = await request.json();
    expect(body.voice_memo_url).toBe('https://example.com/memo.m4a');
    expect(body.from).toBe('+12025551234');
  });

  it('requires url flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsVoicememo(['chat-123'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag');
  });
});
