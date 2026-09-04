import { useMyProfile } from './hooks';

/**
 * Placeholder Profile screen.
 *
 * It only proves the wiring — router → react-query hook → typed mock API.
 * Replace the body with the real header / stats card / tabs port of
 * `kickr/lib/features/profile`. Building blocks to add under
 * `src/features/profile/components/`:
 *   - ProfileHeader (avatar, name, @username, edit + QR actions)
 *   - ProfileStatsCard (matchesPlayed / wins / mvpCount / avgRating)
 *   - ProfileTabs (events / groups / history)
 *   - EditProfileForm (PATCH /users/me via useUpdateProfile)
 *   - AvatarPicker (POST /users/me/avatar via useUploadAvatar)
 *   - UserQrDialog (GET /users/me/qr via useMyQr)
 */
export default function ProfilePage() {
  const { data: user, isLoading, isError, error } = useMyProfile();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Profile</h1>
        <p className="text-sm text-slate-500">
          Placeholder route — scaffolded, not yet built out.
        </p>
      </header>

      {isLoading && (
        <div className="animate-pulse rounded-xl border border-slate-200 p-6">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-48 rounded bg-slate-100" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load profile: {error instanceof Error ? error.message : 'unknown error'}
        </div>
      )}

      {user && (
        <div className="rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-pitch-100 text-xl font-semibold text-pitch-700">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-ink">
                {user.displayName || user.name}
              </p>
              {user.username && (
                <p className="text-sm text-slate-500">@{user.username}</p>
              )}
            </div>
          </div>

          {user.biography && (
            <p className="mt-4 text-sm text-slate-600">{user.biography}</p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Preferred sport</dt>
              <dd className="text-ink">{user.preferredSport ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Position</dt>
              <dd className="text-ink">{user.footballPosition ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">City</dt>
              <dd className="text-ink">{user.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sports</dt>
              <dd className="text-ink">{user.sports.join(', ') || '—'}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-slate-400">
            Serving {import.meta.env.VITE_USE_MOCKS === 'true' ? 'mock' : 'live'} data
            · user id {user._id}
          </p>
        </div>
      )}
    </section>
  );
}
