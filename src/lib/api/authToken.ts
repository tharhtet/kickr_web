/**
 * Holds the bearer token used for authenticated requests.
 *
 * The scaffold keeps it in memory + localStorage; swap this module for a real
 * auth flow (Cognito, refresh tokens, etc.) without touching the HTTP client.
 */
const STORAGE_KEY = 'kickr.accessToken';

let token: string | null = readInitial();

function readInitial(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return token;
}

export function setAccessToken(next: string | null): void {
  token = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — in-memory value still applies */
  }
}
