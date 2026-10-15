import type { GroupDetail, GroupMember, GroupPhoto, GroupMemberRole } from './types';

/** Mock group returned by the mocked `GET /groups/:id` for any id. */
export const groupDetailFixture: GroupDetail = {
  _id: '66b0c0ffee0000000000c001',
  name: 'Aura Bangkok',
  handle: 'aura-bangkok',
  description:
    'This is a friendly group in Bangkok. All levels welcome — we play every Thursday night.',
  sportType: 'football',
  country: 'th',
  city: 'bangkok',
  rules: '',
  isPrivate: false,
  maxPlayers: 22,
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
  userRole: null,
  memberStatus: null,
  isCashier: false,
};

const MEMBERS: [string, GroupMemberRole][] = [
  ['Nay Paing', 'owner'],
  ['Thar Htet', 'captain'],
  ['Kyaw Zin', 'member'],
  ['Somchai P', 'member'],
  ['Min Thu', 'member'],
  ['Arthit K', 'member'],
  ['Zaw Lin', 'member'],
];

/** Mock roster for `GET /groups/:id/members`. */
export const groupMembersFixture: GroupMember[] = MEMBERS.map(([name, role], i) => ({
  _id: `gm${i + 1}`,
  groupId: groupDetailFixture._id,
  userId: { _id: `u${i + 1}`, name },
  role,
  level: 1,
  status: 'approved',
  joinedAt: `2026-0${8 + Math.min(i, 1)}-0${2 + i}T00:00:00.000Z`,
}));

/** Mock gallery for `GET /groups/:id/photos`. */
export const groupPhotosFixture: GroupPhoto[] = [1, 2, 3].map((n) => ({
  _id: `ph${n}`,
  targetType: 'group',
  targetId: groupDetailFixture._id,
  groupId: null,
  url: `/slide/image${n}.png`,
  fileId: `file${n}`,
  uploadedBy: 'u1',
  createdAt: `2026-09-0${n}T00:00:00.000Z`,
}));
