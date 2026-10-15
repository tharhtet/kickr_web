/**
 * Types mirror the kickr backend `groups` + `photos` modules:
 *   - src/groups/schemas/group.schema.ts, group-member.schema.ts
 *   - GroupsService.findById / listMembers
 *   - src/photos (GET /groups/:id/photos)
 * Keep them in sync when the API changes.
 */

export const GROUP_MEMBER_ROLES = [
  'owner',
  'admin',
  'captain',
  'vice-captain',
  'referee',
  'member',
] as const;
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number];

export type MemberStatus = 'pending' | 'approved';

/**
 * Shape returned by `GET /groups/:id`.
 *
 * A private group is narrowed for non-members to the card fields + `rules`,
 * so everything beyond those is optional.
 */
export interface GroupDetail {
  _id: string;
  name: string;
  /** Without the leading "@". */
  handle?: string;
  description?: string;
  logo?: string;
  wallpaper?: string;
  sportType?: string;
  country?: string;
  city?: string;
  rules: string;
  isPrivate?: boolean;
  maxPlayers?: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Caller's role / membership — absent when unauthenticated. */
  userRole?: GroupMemberRole | null;
  memberStatus?: MemberStatus | null;
  isCashier: boolean;
}

export interface MemberUser {
  _id: string;
  name: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
}

/** One row of `GET /groups/:id/members` (approved members only). */
export interface GroupMember {
  _id: string;
  groupId: string;
  userId: MemberUser;
  role: GroupMemberRole;
  level: number;
  status: MemberStatus;
  joinedAt?: string;
  createdAt?: string;
  /** Present (true) only on the cashier's row. */
  isCashier?: true;
}

export interface GroupPhoto {
  _id: string;
  targetType: 'group' | 'event';
  targetId: string;
  groupId: string | null;
  url: string;
  fileId: string;
  uploadedBy: string;
  createdAt: string;
}

/** Shape returned by `GET /groups/:id/photos` — newest first, includes event photos. */
export interface GroupPhotosResponse {
  photos: GroupPhoto[];
}
