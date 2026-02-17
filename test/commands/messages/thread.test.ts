import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesThread from '../../../src/commands/messages/thread.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('messages thread', () => {
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

  it('gets message thread', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        messages: [
          { id: 'msg-1', parts: [{ type: 'text', value: 'Original' }] },
          { id: 'msg-2', parts: [{ type: 'text', value: 'Reply' }] },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesThread(['msg-1'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.linqapp.com/api/partner/v3/messages/msg-1/thread'
    );
    expect((init as RequestInit).method).toBe('GET');
  });

  it('passes pagination and order params', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, { messages: [], next_cursor: null })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesThread(
      ['msg-1', '--limit', '10', '--order', 'desc'],
      config
    );
    await cmd.run();

    const [url] = mockFetch.mock.calls[0];
    const parsedUrl = new URL(url as string);
    expect(parsedUrl.searchParams.get('limit')).toBe('10');
    expect(parsedUrl.searchParams.get('order')).toBe('desc');
  });

  it('requires message ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesThread([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
