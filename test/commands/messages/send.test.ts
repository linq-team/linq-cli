import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesSend from '../../../src/commands/messages/send.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('messages send', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let lastRequestBody: unknown;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    lastRequestBody = null;

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

  it('sends message to existing chat', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, {
        chat_id: 'chat-123',
        message: { id: 'msg-456' },
      });
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesSend(
      ['chat-123', '--from', '+12025551234', '--message', 'Hello!'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/chats/chat-123/messages');
    expect(request.method).toBe('POST');

    const body = lastRequestBody as {
      from: string;
      message: { parts: { value: string }[] };
    };
    expect(body.from).toBe('+12025551234');
    expect(body.message.parts[0].value).toBe('Hello!');
  });

  it('includes effect when specified', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, {
        chat_id: 'chat-123',
        message: { id: 'msg-456' },
      });
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesSend(
      ['chat-123', '--from', '+12025551234', '--message', 'Wow!', '--effect', 'fireworks'],
      config
    );
    await cmd.run();

    const body = lastRequestBody as {
      message: { effect: { type: string; name: string } };
    };
    expect(body.message.effect).toEqual({ type: 'screen', name: 'fireworks' });
  });

  it('includes reply-to when specified', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, {
        chat_id: 'chat-123',
        message: { id: 'msg-456' },
      });
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesSend(
      ['chat-123', '--from', '+12025551234', '--message', 'Reply', '--reply-to', 'original-msg-id'],
      config
    );
    await cmd.run();

    const body = lastRequestBody as {
      message: { reply_to: { message_id: string; part_index: number } };
    };
    expect(body.message.reply_to).toEqual({ message_id: 'original-msg-id', part_index: 0 });
  });

  it('requires chat ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesSend(['--from', '+12025551234', '--message', 'Hello!'], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
