export type Platform = 'ios' | 'android';

/** The "a newer version exists" prompt for one platform. */
export interface AppUpdatePlatform {
  /** Dotted version, e.g. `1.0.1`. */
  latestVersion: string;
  /** Builds below this are too old to keep running. */
  minimumVersion: string;
  upgradeTitle: string;
  upgradeDescription: string;
  forceUpdate: boolean;
}

/** The "major update" announcement for one platform. */
export interface MajorUpdatePlatform {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
}

/** Body of `POST /app-config` — a complete config. */
export interface AppConfigInput {
  appUpdate: Record<Platform, AppUpdatePlatform>;
  majorUpdate: Record<Platform, MajorUpdatePlatform>;
}

/** Body of `PATCH /app-config` — only the fields that change. */
export interface UpdateAppConfigInput {
  appUpdate?: Partial<Record<Platform, Partial<AppUpdatePlatform>>>;
  majorUpdate?: Partial<Record<Platform, Partial<MajorUpdatePlatform>>>;
}

/** One saved revision (unwrapped from `{ data }`). The highest is live. */
export interface AppConfigRevision extends AppConfigInput {
  revision: number;
  /** Id of the superadmin who saved it. */
  updatedBy: string | null;
  createdAt: string;
}
