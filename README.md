# kickr_web

Web client for kickr — **React + Vite + TypeScript**, Tailwind CSS v4, React
Router v7, TanStack Query v5.

This is a **scaffold**. The Profile route is wired end to end (router →
react-query hook → typed API layer) but rendered as a placeholder; build the
real screen out from there.

## Getting started

```bash
npm install
cp .env.example .env   # already done if .env exists
npm run dev            # http://localhost:5173
```

Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`.

## Data layer

The API layer ships in **mock mode** so the UI runs with no backend.

| `.env` var           | Purpose                                                              |
| -------------------- | ------------------------------------------------------------------- |
| `VITE_USE_MOCKS`     | `true` → serve `src/features/*/fixtures.ts`; `false` → call the API |
| `VITE_API_BASE_URL`  | kickr NestJS backend base URL (default `http://localhost:3000`)     |

To point at the real backend: set `VITE_USE_MOCKS=false`, ensure the backend is
running, and provide a bearer token via `setAccessToken()` from
`src/lib/api/authToken.ts` (wire this to a real auth flow later).

Each feature's `api.ts` has a `mock*` implementation and a real HTTP one behind
the same function; `env.useMocks` picks. No `if (mock)` checks leak into
components.

## Layout

```
src/
  config/env.ts             # the only reader of import.meta.env
  lib/
    api/
      http.ts               # fetch wrapper: base URL, bearer auth, ApiError
      errors.ts             # ApiError + isApiError
      authToken.ts          # bearer token store (swap for real auth)
      mock.ts               # delay() / clone() helpers
    queryClient.ts          # shared QueryClient
  components/layout/        # AppLayout (header + <Outlet/>)
  pages/                    # route-level pages with no feature module
  features/
    profile/
      types.ts              # mirrors backend users schema + DTO
      fixtures.ts           # mock data
      api.ts                # profileApi — mock + HTTP behind one surface
      hooks.ts              # useMyProfile / useUpdateProfile / useMyQr / ...
      ProfilePage.tsx       # placeholder route
      components/           # (empty) header, stats card, tabs, edit form...
  router.tsx                # createBrowserRouter
  App.tsx                   # providers
  main.tsx                  # entry
```

`@/` is aliased to `src/` (see `vite.config.ts` + `tsconfig.app.json`).

## Backend endpoints modelled

From `kickr_backend/src/users/users.controller.ts`:

| Method | Path                  | Hook / api fn                          |
| ------ | --------------------- | ------------------------------------- |
| GET    | `/users/me`           | `useMyProfile()` / `profileApi.getMe` |
| PATCH  | `/users/me`           | `useUpdateProfile()`                  |
| POST   | `/users/me/avatar`    | `useUploadAvatar()`                   |
| GET    | `/users/me/qr`        | `useMyQr()`                          |
| GET    | `/users/:id/profile`  | `usePublicProfile(id)`               |

Types in `features/profile/types.ts` track `user.schema.ts`,
`profile.constants.ts`, and `update-profile.dto.ts` — keep them in sync.

## Next steps for the Profile screen

Port `kickr/lib/features/profile` into `features/profile/components/`:
`ProfileHeader`, `ProfileStatsCard`, `ProfileTabs` (events / groups / history),
`EditProfileForm`, `AvatarPicker`, `UserQrDialog`. Add the `u/:userId` route in
`router.tsx` for public profiles.
