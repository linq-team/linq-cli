import Linq from '@linqapp/sdk';

const API_BASE_URL =
  process.env.LINQ_API_URL || 'https://api.linqapp.com/api/partner';

export function createApiClient(token: string) {
  return new Linq({
    apiKey: token,
    baseURL: API_BASE_URL,
  });
}
