import createClient from 'openapi-fetch';
import type { paths } from '../gen/api-types.js';

const API_BASE_URL =
  process.env.LINQ_API_URL || 'https://api.linqapp.com/api/partner';

export function createApiClient(token: string) {
  return createClient<paths>({
    baseUrl: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
