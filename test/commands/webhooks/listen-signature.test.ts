import { describe, it, expect } from 'vitest';
import * as crypto from 'node:crypto';
import Linq from '@linqapp/sdk';

// Mirrors forwardEvent() in src/commands/webhooks/listen.ts. The point of these
// tests is dev/prod parity: what `--forward-to` signs must be accepted by
// `client.webhooks.unwrap()`, which is what we tell developers to write. If these
// drift, a handler verifies fine in production and fails against the local
// forwarder — and the natural response to that is to delete the verification.

function decodeSigningSecret(secret: string): Buffer {
  const raw = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  const body = raw.replace(/=+$/, '');
  if (body.length > 0 && /^[A-Za-z0-9+/]+$/.test(body)) return Buffer.from(raw, 'base64');
  if (body.length > 0 && /^[A-Za-z0-9\-_]+$/.test(body)) return Buffer.from(raw, 'base64url');
  return Buffer.from(raw, 'utf8');
}

function signStandard(secret: string, webhookId: string, timestamp: string, payload: string): string {
  return (
    'v1,' +
    crypto
      .createHmac('sha256', decodeSigningSecret(secret))
      .update(`${webhookId}.${timestamp}.${payload}`)
      .digest('base64')
  );
}

function delivery(secret: string, payload: string) {
  const webhookId = `msg_${crypto.randomUUID().replace(/-/g, '')}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    headers: {
      'webhook-id': webhookId,
      'webhook-timestamp': timestamp,
      'webhook-signature': signStandard(secret, webhookId, timestamp, payload),
    },
  };
}

describe('webhooks listen — forwarded signature', () => {
  const client = new Linq({ apiKey: 'test-placeholder' });
  const payload = JSON.stringify({ event_type: 'message.received', data: { id: 'abc' } });

  it('produces a signature the SDK unwrap() accepts', () => {
    const secret = 'whsec_' + crypto.randomBytes(32).toString('base64');
    const event = client.webhooks.unwrap(payload, { ...delivery(secret, payload), key: secret });
    expect(event).toBeTruthy();
  });

  it('rejects a tampered body', () => {
    const secret = 'whsec_' + crypto.randomBytes(32).toString('base64');
    const signed = delivery(secret, payload);
    expect(() => client.webhooks.unwrap(payload + ' ', { ...signed, key: secret })).toThrow();
  });

  it('rejects a signature made with a different secret', () => {
    const secret = 'whsec_' + crypto.randomBytes(32).toString('base64');
    const other = 'whsec_' + crypto.randomBytes(32).toString('base64');
    const signed = delivery(other, payload);
    expect(() => client.webhooks.unwrap(payload, { ...signed, key: secret })).toThrow();
  });

  describe('decodeSigningSecret', () => {
    it('strips the whsec_ prefix before decoding', () => {
      const bytes = crypto.randomBytes(32);
      const b64 = bytes.toString('base64');
      expect(decodeSigningSecret(`whsec_${b64}`)).toEqual(bytes);
    });

    it('decodes a legacy secret carrying no prefix', () => {
      const bytes = crypto.randomBytes(32);
      expect(decodeSigningSecret(bytes.toString('base64'))).toEqual(bytes);
    });

    it('falls back to url-safe base64', () => {
      // Force '-' and '_' into the encoding so standard base64 would be invalid.
      const bytes = Buffer.from([0xfb, 0xef, 0xbe, 0xfb, 0xef, 0xbe]);
      const urlSafe = bytes.toString('base64url');
      expect(urlSafe).toMatch(/[-_]/);
      expect(decodeSigningSecret(urlSafe)).toEqual(bytes);
    });

    it('falls back to raw bytes for a non-base64 secret', () => {
      expect(decodeSigningSecret('not valid base64!!')).toEqual(Buffer.from('not valid base64!!', 'utf8'));
    });
  });
});
