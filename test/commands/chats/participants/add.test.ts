import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ParticipantsAdd from '../../../../src/commands/chats/participants/add.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('chats participants add', () => {
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

  it('adds participant to chat', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(202, { status: 'accepted', message: 'Participant addition queued' })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ParticipantsAdd(['chat-123', '--handle', '+19876543210'], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/chats/chat-123/participants');
    expect(request.method).toBe('POST');
    const body = await request.json();
    expect(body.handle).toBe('+19876543210');
  });

  it('requires handle flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ParticipantsAdd(['chat-123'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag');
  });
});
