import { describe, it, expect } from 'vitest';
import { runCommand } from '@oclif/test';
import http from 'node:http';

describe('listen', () => {
  it('starts server and responds to webhooks', async () => {
    // Start the server
    const commandPromise = runCommand(['listen', '--port', '14040']);

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send a webhook event
    const eventData = {
      event_type: 'message.received',
      created_at: '2024-01-15T10:30:00Z',
      data: {
        from: '+14155559876',
        message: {
          parts: [{ type: 'text', value: 'Hello there!' }],
        },
      },
    };

    const statusCode = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 14040,
          path: '/webhook',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          resolve(res.statusCode || 500);
        }
      );
      req.on('error', reject);
      req.write(JSON.stringify(eventData));
      req.end();
    });

    expect(statusCode).toBe(200);

    // Trigger shutdown
    process.emit('SIGINT', 'SIGINT');
    await commandPromise;
  });

  it('returns 404 for non-webhook paths', async () => {
    const commandPromise = runCommand(['listen', '--port', '14041']);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const statusCode = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 14041,
          path: '/other',
          method: 'POST',
        },
        (res) => {
          resolve(res.statusCode || 500);
        }
      );
      req.on('error', reject);
      req.end();
    });

    expect(statusCode).toBe(404);

    process.emit('SIGINT', 'SIGINT');
    await commandPromise;
  });

  it('returns 405 for non-POST to webhook', async () => {
    const commandPromise = runCommand(['listen', '--port', '14042']);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const statusCode = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 14042,
          path: '/webhook',
          method: 'GET',
        },
        (res) => {
          resolve(res.statusCode || 500);
        }
      );
      req.on('error', reject);
      req.end();
    });

    expect(statusCode).toBe(405);

    process.emit('SIGINT', 'SIGINT');
    await commandPromise;
  });
});
