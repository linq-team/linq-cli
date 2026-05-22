// Error helpers used by every command.
//
//   throwHttpError(res) — throw from a non-2xx Response so the catch
//   block can treat it the same as an SDK throw.
//
//   bail(cmd, json, input) — exit with a formatted error. Text mode by
//   default; JSON when the --json flag is on.

type CommandLike = {
  log: (msg: string) => void;
  error: (msg: string) => never;
  exit: (code: number) => never;
};

interface ErrorFields {
  status?: number;
  code?: number | string;
  message: string;
  trace_id?: string;
}

// Pull the human-readable message out of a server response body,
// regardless of which shape the server used. Returns null if nothing
// usable was found so callers can supply a fallback.
function extractServerMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const nested = b.error;
  if (nested && typeof nested === 'object') {
    const m = (nested as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  if (typeof b.message === 'string') return b.message;
  if (Array.isArray(b.message) && b.message.length > 0 && typeof b.message[0] === 'string') {
    return b.message.join('; ');
  }
  return null;
}

export async function throwHttpError(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({} as unknown));
  const msg = extractServerMessage(body) ?? 'Request failed';
  throw {
    status: res.status,
    error: body,
    headers: res.headers,
    message: `${res.status} ${msg}`,
  };
}

function extract(input: unknown): ErrorFields {
  if (typeof input === 'string') return { message: input };

  if (input && typeof input === 'object') {
    const i = input as Record<string, unknown>;

    if (typeof i.status === 'number' && i.error && typeof i.error === 'object') {
      const body = i.error;
      const nested = (body as { error?: { code?: number | string } }).error;
      const code = nested && typeof nested === 'object' ? nested.code : undefined;
      const trace_id = (body as { trace_id?: string }).trace_id;
      return {
        status: i.status,
        code,
        message: extractServerMessage(body) ?? 'Request failed',
        trace_id,
      };
    }

    const name = (i as { name?: string }).name;
    if (name === 'APIConnectionError' || name === 'APIConnectionTimeoutError') {
      return { message: 'Could not reach Linq. Check your connection and try again.' };
    }

    // Generic Error fallback.
    if (input instanceof Error) return { message: input.message };
  }

  return { message: String(input) };
}

export function bail(cmd: CommandLike, json: boolean | undefined, input: unknown): never {
  const fields = extract(input);
  if (json) {
    cmd.log(JSON.stringify({ error: fields }, null, 2));
    cmd.exit(1);
  }
  const prefix = fields.status ? `${fields.status} ` : '';
  cmd.error(`${prefix}${fields.message}`);
}
