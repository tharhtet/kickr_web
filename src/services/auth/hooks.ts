import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  clearSession,
  getAccessToken,
  setAccessToken,
  setExpiresIn,
  setRefreshToken,
  setSub,
  subscribeSession,
} from '@/lib/api/authToken';
import { ApiError } from '@/lib/api/errors';
import { profileApi, profileKeys } from '@/services/profile';
import { authApi } from './api';
import type { LoginInput, SignupInput } from './types';

/**
 * `POST /auth/login` — stores the Cognito session, then routes into the
 * dashboard unless `onSuccess` is given (e.g. the in-page login modal).
 * The dashboard is superadmin-only, so that path also loads `GET /users/me`
 * and rejects (clearing the session) any other role.
 */
export function useLogin(options?: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { accessToken, refreshToken, sub, expiresIn } = await authApi.login(input);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setSub(sub);
      setExpiresIn(expiresIn);
      if (options?.onSuccess) return;

      try {
        const me = await profileApi.getMe();
        if (me.role !== 'superadmin') {
          throw new ApiError(403, "This account doesn't have access to the dashboard.", null);
        }
        qc.setQueryData(profileKeys.me(), me);
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    onSuccess: () => {
      if (options?.onSuccess) options.onSuccess();
      else navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

/** `POST /auth/signup` — creates the account; pair with `useLogin` to sign in. */
export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
  });
}

/** Clears the stored session and returns to the login screen. */
export function useLogout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return () => {
    clearSession();
    // Drop the cached `/users/me` so the next account's role is fetched fresh.
    qc.clear();
    navigate('/login', { replace: true });
  };
}

/**
 * Logout for the public site — clears the session but stays on the page,
 * refetching so member-only sections lock again.
 */
export function useSiteLogout() {
  const qc = useQueryClient();
  return () => {
    clearSession();
    qc.removeQueries({ queryKey: profileKeys.all });
    void qc.invalidateQueries();
  };
}

/** Whether an access token is stored — re-renders on login / logout. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribeSession, () => getAccessToken() !== null);
}
