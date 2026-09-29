/**
 * Holds the Cognito session (access token, refresh token, sub) used for
 * authenticated requests and for `POST /auth/refresh` (`RefreshTokenDto`
 * wants `{ sub, refreshToken }` back).
 *
 * Kept in memory + localStorage, one key per field.
 */
const ACCESS_KEY = 'kickr.accessToken';
const REFRESH_KEY = 'kickr.refreshToken';
const SUB_KEY = 'kickr.sub';
const EXPIRES_AT_KEY = 'kickr.expiresAt';

let accessToken: string | null = readInitial(ACCESS_KEY);
let refreshToken: string | null = readInitial(REFRESH_KEY);
let sub: string | null = readInitial(SUB_KEY);
let expiresAt: number | null = Number(readInitial(EXPIRES_AT_KEY)) || null;

function readInitial(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, next: string | null): void {
  try {
    if (next) localStorage.setItem(key, next);
    else localStorage.removeItem(key);
  } catch {
    /* storage unavailable — in-memory value still applies */
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(next: string | null): void {
  accessToken = next;
  write(ACCESS_KEY, next);
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setRefreshToken(next: string | null): void {
  refreshToken = next;
  write(REFRESH_KEY, next);
}

export function getSub(): string | null {
  return sub;
}

export function setSub(next: string | null): void {
  sub = next;
  write(SUB_KEY, next);
}

/** Epoch ms at which the access token expires, if the backend told us. */
export function getExpiresAt(): number | null {
  return expiresAt;
}

/** `expiresIn` is in seconds, as returned by `/auth/login` and `/auth/refresh`. */
export function setExpiresIn(expiresIn: number | null | undefined): void {
  expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
  write(EXPIRES_AT_KEY, expiresAt ? String(expiresAt) : null);
}

/** Clears the whole stored session — call on logout. */
export function clearSession(): void {
  setAccessToken(null);
  setRefreshToken(null);
  setSub(null);
  setExpiresIn(null);
}
