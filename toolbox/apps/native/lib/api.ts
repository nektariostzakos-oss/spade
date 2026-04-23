import Constants from 'expo-constants';
import type { Result } from '@toolbox/shared';

const BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:4000';

export async function api<T>(
  path: string,
  init: RequestInit & { body?: unknown; token?: string | null } = {},
): Promise<Result<T>> {
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
  if (!json) return { ok: false, error: { code: 'INTERNAL', message: `Non-JSON ${res.status}` } };
  return json;
}
