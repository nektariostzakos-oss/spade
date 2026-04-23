import type { Result } from '@toolbox/shared';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiFetchInit extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
}

export async function api<T>(path: string, init: ApiFetchInit = {}): Promise<Result<T>> {
  const { body, token, headers, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as Result<T> | null;
  if (!json) {
    return {
      ok: false,
      error: { code: 'INTERNAL', message: `Non-JSON response (${res.status})` },
    };
  }
  return json;
}
