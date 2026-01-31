import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesDelete from '../../../src/commands/messages/delete.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body?: unknown) {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('messages delete', () => {
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
      JSON.stringify({ token: 'test-token' })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('deletes message successfully', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(204, {});
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesDelete(['msg-123', '--chat', 'chat-456'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/messages/msg-123');
    expect(request.method).toBe('DELETE');

    const body = lastRequestBody as { chat_id: string };
    expect(body.chat_id).toBe('chat-456');
  });

  it('requires chat flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesDelete(['msg-123'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag chat');
  });

  it('requires message ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesDelete(['--chat', 'chat-456'], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
