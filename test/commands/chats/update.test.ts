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
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'chat-123',
        created_at: '2024-01-15T10:00:00Z',
        display_name: 'Team Discussion',
        handles: [{ id: 'h-1', handle: '+19876543210', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' }],
        is_archived: false,
        is_group: true,
        updated_at: '2024-01-15T11:00:00Z',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123', '--name', 'Team Discussion'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.linqapp.com/api/partner/v3/chats/chat-123');
    expect((init as RequestInit).method).toBe('PUT');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.display_name).toBe('Team Discussion');
  });

  it('updates chat icon', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'chat-123',
        created_at: '2024-01-15T10:00:00Z',
        display_name: null,
        handles: [{ id: 'h-1', handle: '+19876543210', joined_at: '2024-01-15T10:00:00Z', service: 'iMessage' }],
        is_archived: false,
        is_group: true,
        group_chat_icon: 'https://example.com/icon.png',
        updated_at: '2024-01-15T11:00:00Z',
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123', '--icon', 'https://example.com/icon.png'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.group_chat_icon).toBe('https://example.com/icon.png');
  });

  it('errors when no flags provided', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsUpdate(['chat-123'], config);

    await expect(cmd.run()).rejects.toThrow('At least one of --name or --icon must be specified');
  });
});
