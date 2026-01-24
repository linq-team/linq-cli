import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import WebhooksList from '../../../src/commands/webhooks/list.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('webhooks list', () => {
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

  it('lists webhooks successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        subscriptions: [
          {
            id: 'webhook-123',
            target_url: 'https://example.com/webhook1',
            is_active: true,
            subscribed_events: ['message.received', 'message.sent'],
          },
          {
            id: 'webhook-456',
            target_url: 'https://example.com/webhook2',
            is_active: false,
            subscribed_events: ['chat.created'],
          },
        ],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksList([], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [request] = mockFetch.mock.calls[0] as [Request];
    expect(request.url).toBe('https://api.linqapp.com/api/partner/v3/webhook-subscriptions');
    expect(request.method).toBe('GET');
  });

  it('handles empty list', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, {
        subscriptions: [],
      })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new WebhooksList([], config);
    await cmd.run();

    expect(mockFetch).toHaveBeenCalledOnce();
  });

});
