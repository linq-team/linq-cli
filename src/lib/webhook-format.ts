import chalk, { type ChalkInstance } from 'chalk';

export function getEventColor(eventType: string): ChalkInstance {
  if (eventType.startsWith('message.failed')) return chalk.red;
  if (eventType.startsWith('message.')) return chalk.blue;
  if (eventType.startsWith('chat.')) return chalk.yellow;
  if (eventType.startsWith('reaction.')) return chalk.magenta;
  if (eventType.startsWith('participant.')) return chalk.green;
  return chalk.cyan;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function flattenObject(
  obj: Record<string, unknown>,
  prefix: string,
  pairs: string[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'event_type') continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        pairs.push(`${chalk.dim(fullKey + '=')}[]`);
      } else if (typeof value[0] === 'object') {
        pairs.push(`${chalk.dim(fullKey + '=')}[${value.length}]`);
      } else {
        pairs.push(`${chalk.dim(fullKey + '=')}[${value.join(',')}]`);
      }
    } else if (typeof value === 'object') {
      flattenObject(value as Record<string, unknown>, fullKey, pairs);
    } else if (typeof value === 'string') {
      const truncated = truncate(value, 80);
      pairs.push(`${chalk.dim(fullKey + '=')}"${truncated}"`);
    } else {
      pairs.push(`${chalk.dim(fullKey + '=')}${value}`);
    }
  }
}

export function formatLogLine(event: Record<string, unknown>): string {
  const timestamp = chalk.dim(new Date().toISOString());
  const eventType = (event.event_type as string) || 'unknown';
  const color = getEventColor(eventType);

  const pairs: string[] = [];
  flattenObject(event, '', pairs);

  return `${timestamp} ${color(`[${eventType}]`)} ${pairs.join(' ')}`;
}
