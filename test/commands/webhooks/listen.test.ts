import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import WebhooksListen from '../../../src/commands/webhooks/listen.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

interface MockWS {
  url: string;
  readyState: number;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  _listeners: Record<string, Array<{ handler: Function; once: boolean }>>;
  _emit: (event: string, data?: unknown) => void;
}

let lastMockWs: MockWS | null = null;
let wsMessages: Record<string, unknown>[] = [];

function createMockWS(url: string): MockWS {
  const listeners: Record<string, Array<{ handler: Function; once: boolean }>> = {};

  const ws: MockWS = {
    url,
    readyState: 0,
    send: vi.fn((data: string) => {
      const parsed = JSON.parse(data);
      if (parsed.action === 'init') {
        queueMicrotask(() => {
          ws._emit('message', { data: JSON.stringify({ connectionId: 'test-conn-id' }) });
          // Delay events so setupMessageHandler is called first
          setTimeout(() => {
            for (const msg of wsMessages) {
              ws._emit('message', { data: JSON.stringify(msg) });
            }
          }, 10);
        });
      }
    }),
    close: vi.fn(() => {
      ws.readyState = 3;
      ws._emit('close', { code: 1000, reason: '' });
    }),
    addEventListener: vi.fn((event: string, handler: Function, opts?: { once?: boolean }) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push({ handler, once: opts?.once ?? false });
    }),
    _listeners: listeners,
    _emit(event: string, data?: unknown) {
      const handlers = listeners[event] || [];
      const toRemove: number[] = [];
      for (let i = 0; i < handlers.length; i++) {
        handlers[i].handler(data);
        if (handlers[i].once) toRemove.push(i);
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        handlers.splice(toRemove[i], 1);
      }
    },
  };

  queueMicrotask(() => {
    ws.readyState = 1;
    ws._emit('open');
  });

  lastMockWs = ws;
  return ws;
}

function MockWebSocket(url: string) { return createMockWS(url); }
MockWebSocket.CLOSED = 3;
vi.stubGlobal('WebSocket', MockWebSocket);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('webhooks listen', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let originalRelayUrl: string | undefined;
  let originalWsUrl: string | undefined;
  let logs: string[];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    originalRelayUrl = process.env.LINQ_RELAY_URL;
    originalWsUrl = process.env.LINQ_RELAY_WS_URL;
    process.env.HOME = tempDir;
    process.env.LINQ_RELAY_URL = 'https://test-relay.example.com';
    process.env.LINQ_RELAY_WS_URL = 'wss://test-ws.example.com';
    mockFetch.mockReset();
    lastMockWs = null;
    wsMessages = [];
    logs = [];

    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: { default: { token: 'test-token-123' } },
      })
    );
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    if (originalRelayUrl === undefined) delete process.env.LINQ_RELAY_URL;
    else process.env.LINQ_RELAY_URL = originalRelayUrl;
    if (originalWsUrl === undefined) delete process.env.LINQ_RELAY_WS_URL;
    else process.env.LINQ_RELAY_WS_URL = originalWsUrl;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function captureOutput(cmd: WebhooksListen): void {
    cmd.log = (...args: string[]) => { logs.push(args.join(' ')); };
  }

  function setupApiMocks() {
    mockFetch.mockImplementation(async (urlArg: string, initArg?: RequestInit) => {
      const url = urlArg;
      const method = initArg?.method ?? 'GET';

      if (url.includes('/webhook-subscriptions') && !url.includes('/webhook-subscriptions/') && method === 'POST') {
        return createMockResponse(201, {
          id: 'wh_test123',
          created_at: '2024-01-15T10:00:00Z',
          is_active: true,
          signing_secret: 'test-secret',
          subscribed_events: ['message.received', 'message.sent'],
          target_url: 'https://test-relay.example.com/relay/test-conn-id',
          updated_at: '2024-01-15T10:00:00Z',
        });
      }
      if (url.includes('/webhook-subscriptions/') && method === 'DELETE') {
        return createMockResponse(200, {});
      }
      return createMockResponse(404, {});
    });
  }

  /** Start command, wait for events, then shut it down cleanly. */
  async function runAndShutdown(cmd: WebhooksListen) {
    const promise = cmd.run();
    // Let microtasks (WS open -> init -> connectionId -> events) settle
    await new Promise((r) => setTimeout(r, 50));
    // Trigger graceful shutdown so listenLoop exits
    await (cmd as unknown as { cleanup(): Promise<void> }).cleanup();
    await promise;
  }

  it('connects via WebSocket, creates webhook, and receives events', async () => {
    wsMessages = [
      { event_type: 'message.received', message: { id: 'msg_1', body: 'Hello' } },
      { event_type: 'message.sent', message: { id: 'msg_2', body: 'World' } },
    ];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    const output = logs.join('\n');
    expect(output).toContain('Connected to relay');
    expect(output).toContain('Webhook created: wh_test123');
    expect(output).toContain('Listening for events');
    expect(output).toContain('message.received');
    expect(output).toContain('message.sent');
  });

  it('passes token in WebSocket URL', async () => {
    wsMessages = [];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    expect(lastMockWs!.url).toContain('token=test-token-123');
  });

  it('sends init action on connect', async () => {
    wsMessages = [];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    expect(lastMockWs!.send).toHaveBeenCalledWith(JSON.stringify({ action: 'init' }));
  });

  it('creates webhook with connectionId-based target URL', async () => {
    wsMessages = [];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    const postCall = mockFetch.mock.calls.find(([urlArg, initArg]: [string, RequestInit?]) => {
      return urlArg.includes('/webhook-subscriptions') && !urlArg.includes('/webhook-subscriptions/') && initArg?.method === 'POST';
    });
    expect(postCall).toBeDefined();
    const body = postCall![1] as RequestInit;
    const bodyText = body.body as string;
    expect(bodyText).toContain('test-conn-id');
    expect(bodyText).toContain('https://test-relay.example.com/relay/test-conn-id');
  });

  it('handles authentication failure via WebSocket close code 4001', async () => {
    // Override mock to simulate auth rejection
    const origWS = globalThis.WebSocket;
    function AuthFailWS(url: string) {
      const ws = createMockWS(url);
      // Intercept: close with 4001 instead of opening normally
      const origEmit = ws._emit.bind(ws);
      ws._emit = (event: string, data?: unknown) => {
        if (event === 'open') {
          queueMicrotask(() => {
            ws.readyState = 3;
            origEmit('close', { code: 4001, reason: 'Unauthorized' });
          });
          return;
        }
        origEmit(event, data);
      };
      return ws;
    }
    AuthFailWS.CLOSED = 3;
    vi.stubGlobal('WebSocket', AuthFailWS);

    setupApiMocks();
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);

    await expect(cmd.run()).rejects.toThrow('Authentication failed');

    vi.stubGlobal('WebSocket', origWS);
  });

  it('filters events when --events flag is used', async () => {
    wsMessages = [
      { event_type: 'message.received', message: { id: 'msg_1', body: 'Hello' } },
      { event_type: 'message.sent', message: { id: 'msg_2', body: 'World' } },
      { event_type: 'chat.created', chat: { id: 'chat_1' } },
    ];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen(['--events', 'message.received'], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    const output = logs.join('\n');
    expect(output).toContain('message.received');
    const chatLogLines = logs.filter((l) => l.includes('[chat.created]'));
    expect(chatLogLines).toHaveLength(0);
  });

  it('outputs raw JSON with --json flag', async () => {
    wsMessages = [
      { event_type: 'message.received', message: { id: 'msg_1', body: 'Hello' } },
    ];
    setupApiMocks();

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen(['--json'], config);
    captureOutput(cmd);
    await runAndShutdown(cmd);

    const jsonLines = logs.filter((l) => l.includes('"event_type"'));
    expect(jsonLines.length).toBeGreaterThan(0);
    const parsed = JSON.parse(jsonLines[0]);
    expect(parsed.event_type).toBe('message.received');
    expect(parsed.message.id).toBe('msg_1');
  });

  it('rejects invalid event names', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen(['--events', 'invalid.event'], config);
    captureOutput(cmd);
    await expect(cmd.run()).rejects.toThrow('Invalid event: invalid.event');
  });

  it('requires authentication token', async () => {
    const configDir = path.join(tempDir, '.linq');
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({ profile: 'default', profiles: { default: {} } })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksListen([], config);
    captureOutput(cmd);
    await expect(cmd.run()).rejects.toThrow('No token found');
  });
});
