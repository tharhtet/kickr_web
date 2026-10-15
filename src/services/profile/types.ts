/**
 * Types mirror the kickr backend `users` module:
 *   - src/users/schemas/user.schema.ts
 *   - src/users/profile.constants.ts
 *   - src/users/dto/update-profile.dto.ts
 * Keep them in sync when the API changes.
 */

export const FOOTBALL_POSITIONS = [
  'goalkeeper',
  'defender',
  'midfielder',
  'forward',
  'playmaker',
] as const;
export type FootballPosition = (typeof FOOTBALL_POSITIONS)[number];

export const PROFILE_VISIBILITY = ['public', 'members', 'private'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITY)[number];

/** Platform-wide roles — unrelated to per-group member roles. */
export const USER_ROLES = ['user', 'superadmin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SPORT_TYPES = ['football', 'futsal', 'padel', 'basketball'] as const;
export type SportType = (typeof SPORT_TYPES)[number];

export interface Privacy {
  profileVisibility: ProfileVisibility;
  showStats: boolean;
  showMatchHistory: boolean;
}

export interface UserStatistics {
  matchesPlayed: number;
  wins: number;
  mvpCount: number;
  avgRating: number;
}

export interface MatchHistoryItem {
  _id: string;
  title: string;
  date: string;
  sportType: SportType;
  status: string;
  locationId?: { _id: string; name: string; lat: number; lng: number } | null;
}

export interface FavouriteTeam {
  _id: string;
  name: string;
  sortOrder?: number;
}

/** Shape returned by `GET /users/me`. */
export interface User {
  _id: string;
  name: string;
  username?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  /** Only 'superadmin' may open the dashboard. */
  role: UserRole;
  height?: number;
  weight?: number;
  profileImage?: string;
  emailVerified?: boolean;
  biography?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  /** Sport-type values from `GET /configuration`. */
  sports: string[];
  preferredSport?: string[];
  footballPosition?: FootballPosition[];
  /** Id of a club from `GET /global-football-teams`. */
  favouriteTeamId?: string | null;
  /** `favouriteTeamId` resolved by `GET /users/me`; null when unset. */
  favouriteTeam?: FavouriteTeam | null;
  privacy?: Privacy;
  inviteCode?: string;
  highlightVideos: string[];
  gallery: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Shape returned by `GET /users/:id/profile` — a public subset plus stats. */
export interface PublicProfile extends Partial<Omit<User, '_id' | 'name' | 'sports'>> {
  _id: string;
  name: string;
  sports: string[];
  statistics?: UserStatistics;
  matchHistory?: MatchHistoryItem[];
}

/** Shape returned by `GET /users/me/qr`. */
export interface QrResponse {
  inviteCode: string;
  inviteLink: string;
}

/** Body accepted by `PATCH /users/me`. All fields optional. */
export interface UpdateProfileInput {
  name?: string;
  username?: string;
  displayName?: string;
  phoneNumber?: string;
  height?: number;
  weight?: number;
  biography?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  /** Each array replaces the stored list — send it whole. */
  sports?: string[];
  preferredSport?: string[];
  footballPosition?: FootballPosition[];
  /** null clears it. */
  favouriteTeamId?: string | null;
  privacy?: Partial<Privacy>;
}
