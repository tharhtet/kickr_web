import { env } from '@/config/env';
import { ApiError } from './errors';
import {
  clearSession,
  getAccessToken,
  getExpiresAt,
  getRefreshToken,
  getSub,
  setAccessToken,
  setExpiresIn,
  setRefreshToken,
} from './authToken';

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

/** Refresh this long before the access token actually expires. */
const REFRESH_SKEW_MS = 60_000;

/** Shape returned by `POST /auth/refresh` (Cognito may omit a new refresh token). */
interface RefreshResponse {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Shared so concurrent requests that hit an expired token trigger one refresh.
let refreshing: Promise<boolean> | null = null;

/**
 * `POST /auth/refresh` with the stored `{ sub, refreshToken }` and saves the
 * new access token. Resolves false (and ends the session) when the refresh
 * token is missing or rejected.
 */
function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const sub = getSub();
    const refreshToken = getRefreshToken();
    if (!sub || !refreshToken) return false;
    try {
      const res = await request<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        json: { sub, refreshToken },
        auth: false,
      });
      setAccessToken(res.accessToken);
      if (res.refreshToken) setRefreshToken(res.refreshToken);
      setExpiresIn(res.expiresIn);
      return true;
    } catch (err) {
      // Network blips keep the session; a rejected refresh token ends it.
      if (err instanceof ApiError) endSession();
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function endSession(): void {
  clearSession();
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

function isTokenExpiring(): boolean {
  const expiresAt = getExpiresAt();
  return expiresAt !== null && Date.now() >= expiresAt - REFRESH_SKEW_MS;
}

function buildUrl(path: string, query?: Query): string {
  // Base URL may be relative (e.g. `/api` via the Vite dev proxy), so resolve
  // against the page origin.
  const url = new URL(
    path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`,
    window.location.origin,
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
 *
 * Authenticated requests refresh the access token via `POST /auth/refresh`
 * when it is about to expire, and retry once after a 401.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true } = options;
  if (!auth) return send<T>(path, options);

  if (isTokenExpiring()) await refreshSession();
  try {
    return await send<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && (await refreshSession())) {
      return send<T>(path, options);
    }
    throw err;
  }
}

async function send<T>(path: string, options: RequestOptions): Promise<T> {
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

  // The backend's global TransformInterceptor wraps every success body as
  // `{ data: T }` — unwrap it so callers get `T` directly.
  if (isRecord(parsed) && 'data' in parsed) {
    return parsed.data as T;
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
