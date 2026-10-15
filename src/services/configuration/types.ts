import type { Region } from '@/services/countries';
import type { SportType } from '@/services/sportTypes';

/**
 * Shape returned by the public `GET /configuration` — mirrors
 * src/configuration/configuration.service.ts in the backend.
 */
export interface Configuration {
  /** Cities per country id (the slug stored as a user's / group's `country`). */
  regions: Record<string, Region[]>;
  sportTypes: SportType[];
}
