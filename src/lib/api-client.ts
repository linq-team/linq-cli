import Linq from '@linqapp/sdk';

const API_BASE_URL =
  process.env.LINQ_API_URL || 'http://localhost:4001';

/** Backend URL for zero-service (OTP, contacts, etc.) */
export const BACKEND_URL =
  process.env.LINQ_BACKEND_URL || 'http://localhost:3003';

export function createApiClient(token: string) {
  return new Linq({
    apiKey: token,
    baseURL: API_BASE_URL,
  });
}
