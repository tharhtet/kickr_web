import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  clearSession,
  setAccessToken,
  setExpiresIn,
  setRefreshToken,
  setSub,
} from '@/lib/api/authToken';
import { authApi } from './api';
import type { LoginInput } from './types';

/** `POST /auth/login` — stores the Cognito session and routes into the dashboard. */
export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ accessToken, refreshToken, sub, expiresIn }) => {
      console.log("helloworld");
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setSub(sub);
      setExpiresIn(expiresIn);
      navigate('/dashboard', { replace: true });
      
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

/** Clears the stored session and returns to the login screen. */
export function useLogout() {
  const navigate = useNavigate();
  return () => {
    clearSession();
    navigate('/login', { replace: true });
  };
}
