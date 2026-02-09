import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import MessagesGet from '../../../src/commands/messages/get.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('messages get', () => {
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

  it('gets message by ID', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        id: 'msg-123',
        chat_id: 'chat-456',
        from: '+19876543210',
        service: 'iMessage',
        is_delivered: true,
        is_read: false,
        sent_at: '2024-01-15T10:30:00Z',
        parts: [{ type: 'text', value: 'Hello!' }],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesGet(['msg-123'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/messages/msg-123');
    expect(request.method).toBe('GET');
  });

  it('requires message ID argument', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new MessagesGet([], config);

    await expect(cmd.run()).rejects.toThrow('Missing 1 required arg');
  });
});
