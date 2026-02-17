import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import WebhooksUpdate from '../../../src/commands/webhooks/update.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('webhooks update', () => {
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

  it('updates webhook URL', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'webhook-123',
        target_url: 'https://new-url.com/webhook',
        is_active: true,
        subscribed_events: ['message.received'],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksUpdate(
      ['webhook-123', '--url', 'https://new-url.com/webhook'],
      config
    );
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://api.linqapp.com/api/partner/v3/webhook-subscriptions/webhook-123'
    );
    expect((init as RequestInit).method).toBe('PUT');

    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.target_url).toBe('https://new-url.com/webhook');
  });

  it('updates webhook events', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'webhook-123',
        target_url: 'https://example.com/webhook',
        is_active: true,
        subscribed_events: ['message.received', 'chat.created'],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksUpdate(
      ['webhook-123', '--events', 'message.received,chat.created'],
      config
    );
    await cmd.run();

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.subscribed_events).toEqual(['message.received', 'chat.created']);
  });

  it('activates webhook', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'webhook-123',
        target_url: 'https://example.com/webhook',
        is_active: true,
        subscribed_events: ['message.received'],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksUpdate(['webhook-123', '--activate'], config);
    await cmd.run();

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.is_active).toBe(true);
  });

  it('deactivates webhook', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(200, {
        id: 'webhook-123',
        target_url: 'https://example.com/webhook',
        is_active: false,
        subscribed_events: ['message.received'],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksUpdate(['webhook-123', '--deactivate'], config);
    await cmd.run();

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.is_active).toBe(false);
  });

  it('requires at least one update flag', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksUpdate(['webhook-123'], config);

    await expect(cmd.run()).rejects.toThrow(
      'At least one of --url, --events, --activate, or --deactivate is required'
    );
  });
});
