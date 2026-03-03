import Linq from '@linqapp/sdk';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API_BASE_URL =
  process.env.LINQ_API_URL || 'https://api.linqapp.com/api/partner';

export function createApiClient(token: string) {
  return new Linq({
    apiKey: token,
    baseURL: API_BASE_URL,
  });
}

/**
 * Creates a Proxy-based client that re-reads ~/.linq/config.json on each
 * property access. This lets the active profile (and its token) change
 * mid-session without restarting the MCP server.
 */
export function createDynamicClient(): Linq {
  let cached: { client: Linq; token: string } | null = null;

  return new Proxy({} as Linq, {
    get(_, prop) {
      const configPath = join(process.env.HOME || homedir(), '.linq', 'config.json');
      const configFile = JSON.parse(readFileSync(configPath, 'utf-8'));

      const envProfile = process.env.LINQ_PROFILE;
      const profileName = envProfile || configFile.profile;
      const profile = configFile.profiles?.[profileName];
      const token = process.env.LINQ_TOKEN || profile?.token;

      if (!token) {
        throw new Error(
          `No token for active profile "${profileName}". Run \`linq init\` in your terminal to set up your account.`
        );
      }

      if (!cached || cached.token !== token) {
        cached = { client: new Linq({ apiKey: token, baseURL: API_BASE_URL }), token };
      }

      return (cached.client as any)[prop];
    },
  });
}
