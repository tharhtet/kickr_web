import { useEffect, useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { gradientBtn } from './DetailUI';
import Modal, { modalInput as input, type ModalSummary } from './Modal';
import { IconEye, IconEyeOff } from '@/components/ui/icons';
import { isApiError } from '@/lib/api/errors';
import { useLogin, useSignup } from '@/services/auth/hooks';

export type AuthMode = 'login' | 'signup';

/** Backend `SignupDto` limits. */
const PASSWORD_MIN = 8;
const NAME_MIN = 2;
const NAME_MAX = 60;

/**
 * Inline login / sign-up for the public detail pages. Works without leaving
 * the page, then refetches everything so member-only sections and the
 * caller's membership show up. Sign-up is auto-confirmed by the backend, so
 * it logs straight in with the same credentials.
 */
export default function LoginModal({
  open,
  onClose,
  title,
  subtitle,
  summary,
  initialMode = 'login',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  summary?: ModalSummary;
  initialMode?: AuthMode;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin({
    onSuccess: () => {
      void queryClient.invalidateQueries();
      onClose();
    },
  });
  const signup = useSignup();
  const ids = useId();
  const signingUp = mode === 'signup';

  // Start clean each time it opens.
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setPassword('');
      setShowPassword(false);
      login.reset();
      signup.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function switchMode(next: AuthMode) {
    setMode(next);
    login.reset();
    signup.reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (signingUp) {
      signup.mutate(
        { name: name.trim(), email, password },
        { onSuccess: () => login.mutate({ email, password }) },
      );
    } else {
      login.mutate({ email, password });
    }
  }

  const error = signup.error ?? login.error;
  const errorMessage = error
    ? isApiError(error)
      ? error.message
      : 'Something went wrong. Please try again.'
    : null;
  const pending = signup.isPending || login.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={signingUp ? 'Create your KickR account' : title}
      subtitle={signingUp ? "It's free — you'll be logged in right after." : subtitle}
      summary={summary}
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {signingUp && (
          <div>
            <label htmlFor={`${ids}-name`} className="mb-1.5 block text-sm font-semibold text-ink">
              Name
            </label>
            <input
              id={`${ids}-name`}
              type="text"
              autoComplete="name"
              autoFocus
              required
              minLength={NAME_MIN}
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={input}
            />
          </div>
        )}

        <div>
          <label htmlFor={`${ids}-email`} className="mb-1.5 block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id={`${ids}-email`}
            type="email"
            autoComplete="email"
            autoFocus={!signingUp}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={input}
          />
        </div>

        <div>
          <label
            htmlFor={`${ids}-password`}
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Password
          </label>
          <div className="relative">
            <input
              id={`${ids}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete={signingUp ? 'new-password' : 'current-password'}
              required
              minLength={signingUp ? PASSWORD_MIN : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                signingUp ? `At least ${PASSWORD_MIN} characters` : 'Enter your password'
              }
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-2 hover:text-ink"
            >
              {showPassword ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`w-full rounded-2xl py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 ${gradientBtn}`}
        >
          {signup.isPending
            ? 'Creating account…'
            : login.isPending
              ? 'Logging in…'
              : signingUp
                ? 'Create account & continue'
                : 'Log in & continue'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-dim">
        {signingUp ? 'Already have an account?' : 'New to KickR?'}{' '}
        <button
          type="button"
          onClick={() => switchMode(signingUp ? 'login' : 'signup')}
          className="font-bold text-pitch-600 hover:underline"
        >
          {signingUp ? 'Log in' : 'Create an account'}
        </button>
      </p>
      <p className="mt-4 text-center text-xs text-cream-dim">
        By continuing you agree to KickR's{' '}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </Modal>
  );
}
