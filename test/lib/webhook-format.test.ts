import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chalk from 'chalk';
import {
  getEventColor,
  truncate,
  flattenObject,
  formatLogLine,
} from '../../src/lib/webhook-format.js';

// Force chalk colors in test environment
const originalLevel = chalk.level;
beforeEach(() => {
  chalk.level = 3;
});
afterEach(() => {
  chalk.level = originalLevel;
});

describe('getEventColor', () => {
  it('returns red for message.failed', () => {
    expect(getEventColor('message.failed')).toBe(chalk.red);
  });

  it('returns blue for message.* events', () => {
    expect(getEventColor('message.sent')).toBe(chalk.blue);
    expect(getEventColor('message.received')).toBe(chalk.blue);
    expect(getEventColor('message.delivered')).toBe(chalk.blue);
  });

  it('returns yellow for chat.* events', () => {
    expect(getEventColor('chat.created')).toBe(chalk.yellow);
    expect(getEventColor('chat.typing_indicator.started')).toBe(chalk.yellow);
  });

  it('returns magenta for reaction.* events', () => {
    expect(getEventColor('reaction.added')).toBe(chalk.magenta);
    expect(getEventColor('reaction.removed')).toBe(chalk.magenta);
  });

  it('returns green for participant.* events', () => {
    expect(getEventColor('participant.added')).toBe(chalk.green);
    expect(getEventColor('participant.removed')).toBe(chalk.green);
  });

  it('returns cyan for unknown events', () => {
    expect(getEventColor('something.else')).toBe(chalk.cyan);
  });

  it('prioritizes message.failed over message.*', () => {
    expect(getEventColor('message.failed')).toBe(chalk.red);
  });
});

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('hello', 80)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long, 80);
    expect(result.length).toBe(80);
    expect(result.endsWith('...')).toBe(true);
  });

  it('handles exact length strings', () => {
    const exact = 'a'.repeat(80);
    expect(truncate(exact, 80)).toBe(exact);
  });
});

describe('flattenObject', () => {
  it('flattens simple key-value pairs', () => {
    const pairs: string[] = [];
    flattenObject({ id: 'msg-123', count: 5 }, '', pairs);
    expect(pairs).toHaveLength(2);
    expect(pairs[0]).toContain('id=');
    expect(pairs[0]).toContain('"msg-123"');
    expect(pairs[1]).toContain('count=');
    expect(pairs[1]).toContain('5');
  });

  it('skips event_type key', () => {
    const pairs: string[] = [];
    flattenObject({ event_type: 'message.sent', id: '123' }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('id=');
  });

  it('skips null and undefined values', () => {
    const pairs: string[] = [];
    flattenObject({ a: null, b: undefined, c: 'yes' }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('c=');
  });

  it('flattens nested objects with dot notation', () => {
    const pairs: string[] = [];
    flattenObject({ message: { id: 'msg-1' } }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('message.id=');
  });

  it('handles empty arrays', () => {
    const pairs: string[] = [];
    flattenObject({ items: [] }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('[]');
  });

  it('shows count for arrays of objects', () => {
    const pairs: string[] = [];
    flattenObject({ items: [{ a: 1 }, { a: 2 }] }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('[2]');
  });

  it('shows values for arrays of primitives', () => {
    const pairs: string[] = [];
    flattenObject({ tags: ['a', 'b', 'c'] }, '', pairs);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('[a,b,c]');
  });

  it('uses prefix for nested keys', () => {
    const pairs: string[] = [];
    flattenObject({ id: '1' }, 'parent', pairs);
    expect(pairs[0]).toContain('parent.id=');
  });
});

describe('formatLogLine', () => {
  it('includes timestamp, event type, and key-value pairs', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'));

    const result = formatLogLine({
      event_type: 'message.received',
      id: 'msg-123',
    });

    expect(result).toContain('2024-01-15T10:30:00.000Z');
    expect(result).toContain('[message.received]');
    expect(result).toContain('msg-123');

    vi.useRealTimers();
  });

  it('handles missing event_type', () => {
    const result = formatLogLine({ id: 'msg-123' });
    expect(result).toContain('[unknown]');
  });
});
