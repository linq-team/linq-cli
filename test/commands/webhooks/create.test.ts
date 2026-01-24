import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import WebhooksCreate from '../../../src/commands/webhooks/create.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('webhooks create', () => {
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

  it('creates webhook with specified events', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, {
        id: 'webhook-123',
        target_url: 'https://example.com/webhook',
        subscribed_events: ['message.received', 'message.sent'],
        is_active: true,
        signing_secret: 'secret-123',
      });
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksCreate(
      ['--url', 'https://example.com/webhook', '--events', 'message.received,message.sent'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/webhook-subscriptions');
    expect(request.method).toBe('POST');

    const body = lastRequestBody as { target_url: string; subscribed_events: string[] };
    expect(body.target_url).toBe('https://example.com/webhook');
    expect(body.subscribed_events).toEqual(['message.received', 'message.sent']);
  });

  it('creates webhook with all events', async () => {
    mockFetch.mockImplementation(async (request: Request) => {
      lastRequestBody = await request.json();
      return createMockResponse(201, {
        id: 'webhook-123',
        target_url: 'https://example.com/webhook',
        subscribed_events: ['message.sent', 'message.received'],
        is_active: true,
        signing_secret: 'secret-123',
      });
    });

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksCreate(
      ['--url', 'https://example.com/webhook', '--all-events'],
      config
    );
    await cmd.run();

    const body = lastRequestBody as { subscribed_events: string[] };
    expect(body.subscribed_events.length).toBeGreaterThan(5);
  });

  it('requires url flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksCreate(['--events', 'message.received'], config);

    await expect(cmd.run()).rejects.toThrow('Missing required flag url');
  });

  it('requires events or all-events flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksCreate(['--url', 'https://example.com/webhook'], config);

    await expect(cmd.run()).rejects.toThrow('Either --events or --all-events is required');
  });
});
