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
    mockFetch.mockResolvedValueOnce(
      createMockResponse(202, {
        chat_id: 'chat-123',
        message: { id: 'msg-456' },
      })
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
