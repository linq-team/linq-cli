import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesReact from '../../../src/commands/messages/react.js';

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

function reactionResponse(type: string, customEmoji?: string) {
  return {
    is_me: true,
    handle: mockHandle,
    type,
    ...(customEmoji && { custom_emoji: customEmoji }),
  };
}

describe('messages react', () => {
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

  it('adds reaction to message', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(200, reactionResponse('love'));
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'love'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/messages/msg-123/reactions');
    expect(request.method).toBe('POST');

    const body = lastRequestBody as { operation: string; type: string };
    expect(body.operation).toBe('add');
    expect(body.type).toBe('love');
  });

  it('removes reaction from message', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(200, reactionResponse('like'));
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'like', '--operation', 'remove'], config);
    await cmd.run();

    const body = lastRequestBody as { operation: string; type: string };
    expect(body.operation).toBe('remove');
    expect(body.type).toBe('like');
  });

  it('supports custom emoji', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(200, reactionResponse('custom', '🎉'));
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'custom', '--emoji', '🎉'], config);
    await cmd.run();

    const body = lastRequestBody as { type: string; custom_emoji: string };
    expect(body.type).toBe('custom');
    expect(body.custom_emoji).toBe('🎉');
  });

  it('requires emoji for custom type', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'custom'], config);

    await expect(cmd.run()).rejects.toThrow('--emoji is required when using --type custom');
  });

  it('requires type flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag type');
  });
});
