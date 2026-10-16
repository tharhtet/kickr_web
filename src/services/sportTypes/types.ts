/** Shape returned by the sport-types endpoints (unwrapped from `{ data }`). */
export interface SportType {
  _id?: string;
  /** Unique lowercase slug, e.g. `football`. Immutable once created. */
  value: string;
  /** Display name, e.g. `Football`. Editable — the backend falls back to `value` when unset. */
  name?: string;
  /** Formats an event of this sport may set as `subType`, e.g. futsal, stadium. */
  subTypes: string[];
  /** Positions a player can take in this sport, e.g. goalkeeper, forward. */
  playerRoles?: string[];
  sortOrder: number;
  /** Whether events of this sport are played as a match. */
  matchProvided: boolean;
}

/** Body of `POST /sport-types`. Omit `sortOrder` to append to the end. */
export interface CreateSportTypeInput {
  value: string;
  /** Display name. Defaults to `value`. 409 if another sport has it. */
  name?: string;
  subTypes?: string[];
  playerRoles?: string[];
  sortOrder?: number;
  matchProvided?: boolean;
}

/** Body of `PATCH /sport-types/:value` — `value` itself cannot be renamed. */
export interface UpdateSportTypeInput {
  /** Display name. `value` (the ID) never changes. 409 if another sport has it. */
  name?: string;
  /** Replaces the whole list. */
  subTypes?: string[];
  /** Replaces the whole list. */
  playerRoles?: string[];
  sortOrder?: number;
  matchProvided?: boolean;
}
