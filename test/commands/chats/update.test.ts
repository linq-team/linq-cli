import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ChatsUpdate from '../../../src/commands/chats/update.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('chats update', () => {
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

  it('updates chat display name', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        id: 'chat-123',
        display_name: 'Team Discussion',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123', '--name', 'Team Discussion'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/chats/chat-123');
    expect(request.method).toBe('PUT');
    const body = await request.json();
    expect(body.display_name).toBe('Team Discussion');
  });

  it('updates chat icon', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        id: 'chat-123',
        group_chat_icon: 'https://example.com/icon.png',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123', '--icon', 'https://example.com/icon.png'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    const body = await request.json();
    expect(body.group_chat_icon).toBe('https://example.com/icon.png');
  });

  it('errors when no flags provided', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123'], config);

    await expect(cmd.run()).rejects.toThrow('At least one of --name or --icon must be specified');
  });
});
