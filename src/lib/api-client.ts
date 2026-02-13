import { Linq } from '@linqapp/sdk';

const API_BASE_URL = process.env.LINQ_API_URL;

export function createLinqClient(token: string): Linq {
  return new Linq({
    bearerAuth: token,
    ...(API_BASE_URL && { serverURL: API_BASE_URL }),
  });
}
