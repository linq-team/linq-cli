export function parseApiError(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (error === null || error === undefined) return 'Unknown error';

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (obj.error && typeof obj.error === 'object') {
      const detail = obj.error as Record<string, unknown>;
      if (typeof detail.message === 'string') return detail.message;
    }
    if (typeof obj.message === 'string') return obj.message;
  }

  if (typeof error === 'string') return error;

  return JSON.stringify(error);
}
