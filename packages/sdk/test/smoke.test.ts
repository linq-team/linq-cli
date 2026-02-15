import { describe, it, expect } from 'vitest';
import { Linq } from '@linqapp/sdk';
import { ErrorResponse } from '@linqapp/sdk/models/errors';
import * as components from '@linqapp/sdk/models/components';

describe('SDK smoke tests', () => {
  it('exports the Linq client class', () => {
    expect(Linq).toBeDefined();
    expect(typeof Linq).toBe('function');
  });

  it('instantiates with a bearer token', () => {
    const client = new Linq({ bearerAuth: 'test-token' });
    expect(client).toBeInstanceOf(Linq);
  });

  it('exposes namespace accessors', () => {
    const client = new Linq({ bearerAuth: 'test-token' });
    expect(client.chats).toBeDefined();
    expect(client.messages).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.attachments).toBeDefined();
    expect(client.phoneNumbers).toBeDefined();
  });

  it('exports ErrorResponse', () => {
    expect(ErrorResponse).toBeDefined();
  });

  it('exports component types', () => {
    expect(components).toBeDefined();
    expect(Object.keys(components).length).toBeGreaterThan(0);
  });
});
