import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import ChatsCreate from '../../../src/commands/chats/create.js';

// Mock the fetch globally with proper Response object
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockHandle = (phone: string) => ({
  id: 'h-1',
  handle: phone,
  service: 'iMessage',
  status: 'active',
  joined_at: '2024-01-15T00:00:00Z',
});

function createChatResponse(overrides: Record<string, unknown> = {}) {
  return {
    chat: {
      id: 'chat-123',
      display_name: null,
      service: 'iMessage',
      is_group: false,
      handles: [mockHandle('+19876543210'), mockHandle('+12025551234')],
      message: {
        id: 'msg-456',
        parts: [{ type: 'text', value: 'Hello!' }],
        sent_at: '2024-01-15T00:00:00Z',
        delivery_status: 'sent',
        is_read: false,
      },
      ...overrides,
    },
  };
}

describe('chats create', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let lastRequestBody: unknown;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    lastRequestBody = null;

    // Create config with token
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

  it('creates chat and sends message successfully', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, createChatResponse());
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsCreate(
      ['--to', '+19876543210', '--from', '+12025551234', '--message', 'Hello!'],
      config
    );
    await cmd.run();

    // Verify the API call
    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/chats');
    expect(request.method).toBe('POST');

    const body = lastRequestBody as {
      to: string[];
      from: string;
      message: { parts: { value: string }[] };
    };
    expect(body.to).toEqual(['+19876543210']);
    expect(body.from).toBe('+12025551234');
    expect(body.message.parts[0].value).toBe('Hello!');
  });

  it('includes effect when specified', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, createChatResponse());
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsCreate(
      ['--to', '+19876543210', '--from', '+12025551234', '--message', 'Party!', '--effect', 'confetti'],
      config
    );
    await cmd.run();

    const body = lastRequestBody as {
      message: { effect: { type: string; name: string } };
    };
    expect(body.message.effect).toEqual({ type: 'screen', name: 'confetti' });
  });

  it('supports multiple recipients for group chats', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, createChatResponse({ is_group: true }));
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsCreate(
      ['--to', '+1111111111', '--to', '+2222222222', '--from', '+12025551234', '--message', 'Group message'],
      config
    );
    await cmd.run();

    const body = lastRequestBody as {
      to: string[];
      from: string;
      message: { parts: { value: string }[] };
    };
    expect(body.to).toEqual(['+1111111111', '+2222222222']);
    expect(body.from).toBe('+12025551234');
    expect(body.message.parts[0].value).toBe('Group message');
  });

  it('requires from address or config fromPhone', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new ChatsCreate(
      ['--to', '+19876543210', '--message', 'Hello!'],
      config
    );

    await expect(cmd.run()).rejects.toThrow('No sender phone found');
  });
});
