/**
 * Types mirror the kickr backend `events` module:
 *   - src/events/schemas/event.schema.ts
 *   - src/events/schemas/event-player.schema.ts
 *   - src/events/events.lifecycle.ts
 *   - EventsService.findById / listPlayers / listByGroup
 * Keep them in sync when the API changes.
 */

/**
 * Football lifecycle, in order. Other sports skip `preparation`.
 * `cancelled` is a second terminal state, not a step.
 */
export const EVENT_STATUSES = [
  'join',
  'preparation',
  'ready_to_play',
  'playing',
  'after_match',
  'done',
  'cancelled',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventType = 'normal' | 'challenge';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface EventResult {
  mvpUserId: string | null;
  mvpGoal: number | null;
  scoreA: number | null;
  scoreB: number | null;
}

/** The event document as stored, plus `isFull` — shared by list and detail. */
export interface EventSummary {
  _id: string;
  title: string;
  description?: string;
  /** ISO kick-off time. */
  date: string;
  groupId: string | null;
  isPublic: boolean;
  createdBy: string;
  locationId: string | null;
  maxPlayers: number;
  joinedCount: number;
  isFull: boolean;
  sportType: string;
  subType: string | null;
  skillLevel: SkillLevel;
  price: number;
  status: EventStatus;
  cancelReason: string | null;
  type: EventType;
  opponentGroupId: string | null;
  /** Minutes. */
  duration: number;
  coverImage: string | null;
  photos: { url: string; fileId: string }[];
  result: EventResult | null;
  templateId: string | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Owning group's identity — null on a standalone event. */
export interface EventGroup {
  _id: string;
  name: string;
  logo: string | null;
  wallpaper: string | null;
}

export interface EventLocation {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  url?: string;
  address?: string;
  city?: string;
  country?: string;
}

/** Shape returned by `GET /events/:id`. Teams / matches / standings omitted — unused here. */
export interface EventDetail extends EventSummary {
  groupRules: string;
  group: EventGroup | null;
  userRole: string | null;
  location: EventLocation | null;
  likedByMe: boolean;
  joinedByMe: boolean;
  isCashier: boolean;
}

export interface PlayerUser {
  _id: string;
  name: string;
  profileImage?: string;
}

/** One row of `GET /events/:id/players`. */
export interface EventPlayer {
  _id: string;
  eventId: string;
  type: 'registered' | 'guest';
  /** Populated for registered players; absent for guests. */
  userId?: PlayerUser | null;
  guestName?: string;
  addedByUserId?: PlayerUser | null;
  joinedAt?: string;
  team: string | null;
  position?: string;
}
