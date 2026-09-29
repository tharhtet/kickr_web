import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isApiError } from '@/lib/api/errors';
import { useLogin } from '@/services/auth/hooks';

/**
 * Standalone chrome (own background, no `AppLayout`) — mirrors `HomePage`,
 * continuing the purple gradient used by `LandingNav`'s "Log in" CTA.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  const errorMessage = login.error
    ? isApiError(login.error)
      ? login.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-12 text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(200,64,232,0.25),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(123,47,247,0.2),transparent_70%)]"
      />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <img src="/logo.png" alt="kickr" className="h-12 w-auto" />
        </Link>

        <div className="rounded-2xl border border-wine-lt bg-white/90 p-8 shadow-[0_24px_64px_-32px_rgba(123,47,247,0.35)] backdrop-blur">
          <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-cream-dim">
            Log in to manage your groups and tournaments.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream-dim"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold-dim focus:ring-2 focus:ring-gold-dim/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream-dim"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold-dim focus:ring-2 focus:ring-gold-dim/20"
              />
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-xl bg-[linear-gradient(120deg,#c840e8,#8b2fe0)] px-7 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_32px_-16px_rgba(123,47,247,0.7)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {login.isPending ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream-dim">
          <Link to="/" className="underline underline-offset-2 hover:text-gold-dim">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
