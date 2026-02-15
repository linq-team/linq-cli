import { ErrorResponse } from '@linqapp/sdk/models/errors';

export function parseApiError(error: unknown): string {
  // SDK ErrorResponse has a structured .error.message
  if (error instanceof ErrorResponse) {
    return error.error?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error === null || error === undefined) return 'Unknown error';

  if (typeof error === 'string') return error;

  return JSON.stringify(error);
}
