import { env } from '@/config/env';
import { ApiError } from './errors';
import { getAccessToken } from './authToken';

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** JSON body — serialized and sent with `Content-Type: application/json`. */
  json?: unknown;
  /** Raw body (e.g. FormData) — takes precedence over `json`. */
  body?: BodyInit;
  query?: Query;
  signal?: AbortSignal;
  /** Set false to skip the Authorization header. Defaults to true. */
  auth?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(
    path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Thin fetch wrapper: base URL, bearer auth, JSON (de)serialization, and a
 * typed {@link ApiError} for non-2xx responses. This is the only place the
 * real backend is contacted.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', json, body, query, signal, auth = true } = options;

  const headers = new Headers();
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let payload: BodyInit | undefined = body;
  if (payload === undefined && json !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(json);
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
    signal,
  });

  const raw = await res.text();
  const parsed = raw ? safeJsonParse(raw) : undefined;

  if (!res.ok) {
    const message =
      (isRecord(parsed) && typeof parsed.message === 'string'
        ? parsed.message
        : undefined) ?? `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, message, parsed ?? raw);
  }

  return parsed as T;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
