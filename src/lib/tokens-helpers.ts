const PRESET_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '60d': 60,
  '90d': 90,
};

export function parseExpiresIn(input: string | undefined): string | undefined {
  if (!input || input === 'none') return undefined;
  const days = PRESET_DAYS[input];
  if (days !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const d = new Date(`${input}T23:59:59.999Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  throw new Error(
    `Invalid --expires-in "${input}". Use 7d, 30d, 60d, 90d, none, or YYYY-MM-DD.`
  );
}

export function formatExpiresAt(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'invalid';
  if (d.getTime() <= Date.now()) return 'expired';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatLastUsed(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'invalid';
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface TokenSummary {
  id: string;
  name: string | null;
  tokenPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt?: string;
}

export interface TokenSummaryWithSecret extends TokenSummary {
  token: string;
}

export interface ListTokensResponse {
  tokens: TokenSummary[];
}

export function findActiveTokenId(
  storedToken: string,
  tokens: TokenSummary[],
): string | undefined {
  const match = tokens.find((t) => storedToken.startsWith(t.tokenPrefix));
  return match?.id;
}

export function isAutomatedEnv(): boolean {
  return (
    !process.stdin.isTTY
    || process.env.CI === 'true'
    || process.env.CLAUDECODE === '1'
    || !!process.env.CURSOR_TRACE_ID
    || !!process.env.AIDER_API_KEY
  );
}
