import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '../../src/lib/constants.js';

describe('normalizePhoneNumber', () => {
  it('prepends +1 to 10-digit numbers', () => {
    expect(normalizePhoneNumber('2055970102')).toBe('+12055970102');
  });

  it('prepends + to 11-digit numbers starting with 1', () => {
    expect(normalizePhoneNumber('12055970102')).toBe('+12055970102');
  });

  it('leaves E.164 numbers unchanged', () => {
    expect(normalizePhoneNumber('+12055970102')).toBe('+12055970102');
  });

  it('leaves international E.164 numbers unchanged', () => {
    expect(normalizePhoneNumber('+447911123456')).toBe('+447911123456');
  });

  it('strips formatting before normalizing', () => {
    expect(normalizePhoneNumber('(205) 597-0102')).toBe('+12055970102');
    expect(normalizePhoneNumber('205-597-0102')).toBe('+12055970102');
    expect(normalizePhoneNumber('205.597.0102')).toBe('+12055970102');
    expect(normalizePhoneNumber('1-205-597-0102')).toBe('+12055970102');
  });

  it('passes through non-matching input', () => {
    expect(normalizePhoneNumber('12345')).toBe('12345');
    expect(normalizePhoneNumber('user@example.com')).toBe('user@example.com');
    expect(normalizePhoneNumber('')).toBe('');
  });
});
