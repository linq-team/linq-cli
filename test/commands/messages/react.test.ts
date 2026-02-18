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

describe('messages react', () => {
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

  it('adds reaction to message', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        handle: { id: 'h-1', handle: '+12025551234', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' },
        is_me: true,
        type: 'love',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'love'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.linqapp.com/api/partner/v3/messages/msg-123/reactions');
    expect((init as RequestInit).method).toBe('POST');

    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.operation).toBe('add');
    expect(body.type).toBe('love');
  });

  it('removes reaction from message', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        handle: { id: 'h-1', handle: '+12025551234', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' },
        is_me: true,
        type: 'love',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'like', '--operation', 'remove'], config);
    await cmd.run();

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.operation).toBe('remove');
    expect(body.type).toBe('like');
  });

  it('supports custom emoji', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        handle: { id: 'h-1', handle: '+12025551234', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' },
        is_me: true,
        type: 'love',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesReact(['msg-123', '--type', 'custom', '--emoji', '\u{1F389}'], config);
    await cmd.run();

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.type).toBe('custom');
    expect(body.custom_emoji).toBe('\u{1F389}');
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
