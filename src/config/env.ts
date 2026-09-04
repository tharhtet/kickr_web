/**
 * Single place that reads `import.meta.env`. Import from here rather than
 * touching `import.meta.env` directly so the values are validated once and
 * the rest of the app depends on a typed object.
 */

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export const env = {
  /** Base URL of the kickr NestJS backend (no trailing slash). */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(
    /\/+$/,
    '',
  ),
  /** When true, the API layer resolves from local fixtures instead of HTTP. */
  useMocks: readBool(import.meta.env.VITE_USE_MOCKS, import.meta.env.DEV),
} as const;
