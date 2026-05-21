import { describe, it, expect } from 'vitest';
import {
  parseExpiresIn,
  formatExpiresAt,
  formatLastUsed,
  findActiveTokenId,
  isAutomatedEnv,
} from '../../src/lib/tokens-helpers.js';

describe('parseExpiresIn', () => {
  it('returns undefined for none / empty', () => {
    expect(parseExpiresIn(undefined)).toBeUndefined();
    expect(parseExpiresIn('none')).toBeUndefined();
  });

  it('converts day presets to future ISO dates', () => {
    const iso = parseExpiresIn('30d');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const diffDays = (new Date(iso!).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(29);
    expect(diffDays).toBeLessThan(31);
  });

  it('accepts YYYY-MM-DD as a custom date', () => {
    const iso = parseExpiresIn('2030-01-15');
    expect(iso).toMatch(/^2030-01-15T/);
  });

  it('throws on garbage', () => {
    expect(() => parseExpiresIn('forever')).toThrow(/Invalid/);
    expect(() => parseExpiresIn('30days')).toThrow(/Invalid/);
  });
});

describe('formatExpiresAt', () => {
  it('returns "never" for null/undefined', () => {
    expect(formatExpiresAt(null)).toBe('never');
    expect(formatExpiresAt(undefined)).toBe('never');
  });

  it('returns "expired" for past dates', () => {
    expect(formatExpiresAt('2020-01-01T00:00:00Z')).toBe('expired');
  });

  it('formats future dates as a short calendar string', () => {
    const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatExpiresAt(future)).toMatch(/\w+ \d+, \d{4}/);
  });
});

describe('formatLastUsed', () => {
  it('returns "never" for null', () => {
    expect(formatLastUsed(null)).toBe('never');
  });

  it('uses relative time within a day', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatLastUsed(fiveMinAgo)).toBe('5m ago');
    const twoHrAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatLastUsed(twoHrAgo)).toBe('2h ago');
  });
});

describe('findActiveTokenId', () => {
  const tokens = [
    { id: 'id-1', name: null, tokenPrefix: 'linq_abc', scopes: [], expiresAt: null, lastUsedAt: null },
    { id: 'id-2', name: null, tokenPrefix: 'XYZ12345', scopes: [], expiresAt: null, lastUsedAt: null },
  ];

  it('matches by prefix', () => {
    expect(findActiveTokenId('linq_abc999XXX', tokens)).toBe('id-1');
    expect(findActiveTokenId('XYZ12345ZZZ', tokens)).toBe('id-2');
  });

  it('returns undefined when nothing matches', () => {
    expect(findActiveTokenId('nope_xxx', tokens)).toBeUndefined();
  });
});

describe('isAutomatedEnv', () => {
  it('returns true when stdin is not a TTY', () => {
    // In vitest, stdin.isTTY is undefined → counts as automated
    expect(isAutomatedEnv()).toBe(true);
  });
});
