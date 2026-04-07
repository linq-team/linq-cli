import Linq from '@linqapp/sdk';

const API_BASE_URL =
  process.env.LINQ_API_URL || 'https://api.linqapp.com/api/partner';

/** Backend URL for zero-service (OTP, contacts, etc.) */
export const BACKEND_URL =
  process.env.LINQ_BACKEND_URL || 'https://prod.zero-service.linqapp.com';

export function createApiClient(token: string) {
  return new Linq({
    apiKey: token,
    baseURL: API_BASE_URL,
  });
}
