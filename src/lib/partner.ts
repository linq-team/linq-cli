const WEBHOOK_BASE_URL =
  process.env.WEBHOOK_BASE_URL || 'https://webhook.linqapp.com';

/**
 * Fetch the partner ID for an API token.
 * Returns null silently on any failure (network, auth, etc).
 */
export async function fetchPartnerId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${WEBHOOK_BASE_URL}/partner-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { partnerId?: string };
    return data.partnerId ?? null;
  } catch {
    return null;
  }
}
