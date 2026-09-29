import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { profileApi } from './api';
import type { UpdateProfileInput, User } from './types';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  myQr: () => [...profileKeys.all, 'me', 'qr'] as const,
  public: (userId: string) =>
    [...profileKeys.all, 'public', userId] as const,
};

/** Current user's own profile (`GET /users/me`). */
export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileApi.getMe(),
  });
}

/** Current user's invite QR payload (`GET /users/me/qr`). */
export function useMyQr(enabled = true) {
  return useQuery({
    queryKey: profileKeys.myQr(),
    queryFn: () => profileApi.getMyQr(),
    enabled,
  });
}

/** Another user's public profile (`GET /users/:id/profile`). */
export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.public(userId ?? ''),
    queryFn: () => profileApi.getPublicProfile(userId as string),
    enabled: Boolean(userId),
  });
}

/** `PATCH /users/me` — writes straight back into the `me` cache on success. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      profileApi.updateProfile(input),
    onSuccess: (user: User) => {
      qc.setQueryData(profileKeys.me(), user);
    },
  });
}

/** `POST /users/me/avatar`. */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (user: User) => {
      qc.setQueryData(profileKeys.me(), user);
    },
  });
}
