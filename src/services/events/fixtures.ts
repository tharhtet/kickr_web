import type { EventDetail, EventPlayer } from './types';

/** Mock event returned by the mocked `GET /events/:id` for any id. */
export const eventDetailFixture: EventDetail = {
  _id: '66b0c0ffee0000000000f001',
  title: 'Aura Bangkok Thursday',
  description:
    'Friendly 8-a-side for all levels. Teams are split on the night by the captain — bring a light and a dark shirt, shin pads and water. Please arrive 15 minutes before kick-off.',
  date: '2026-10-22T11:00:00.000Z',
  groupId: '66b0c0ffee0000000000c001',
  isPublic: true,
  createdBy: '66b0c0ffee0000000000a001',
  locationId: '66b0c0ffee0000000000d101',
  maxPlayers: 22,
  joinedCount: 16,
  isFull: false,
  sportType: 'football',
  subType: null,
  skillLevel: 'beginner',
  price: 120,
  status: 'join',
  cancelReason: null,
  type: 'normal',
  opponentGroupId: null,
  duration: 90,
  coverImage: null,
  photos: [],
  result: null,
  templateId: '66b0c0ffee0000000000t001',
  likeCount: 3,
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-10T09:00:00.000Z',
  groupRules: '',
  group: {
    _id: '66b0c0ffee0000000000c001',
    name: 'Aura Football Brothers FC',
    logo: null,
    wallpaper: null,
  },
  userRole: null,
  location: {
    _id: '66b0c0ffee0000000000d101',
    name: '130Sportcomplex',
    lat: 13.6866,
    lng: 100.6237,
  },
  likedByMe: false,
  joinedByMe: false,
  isCashier: false,
};

const NAMES = ['Nay Paing', 'Thar Htet', 'Kyaw Zin', 'Somchai P', 'Min Thu', 'Arthit K', 'Zaw Lin'];

/** Mock roster for `GET /events/:id/players` — 15 registered players + 1 guest. */
export const eventPlayersFixture: EventPlayer[] = [
  ...Array.from({ length: 15 }, (_, i): EventPlayer => ({
    _id: `p${i + 1}`,
    eventId: eventDetailFixture._id,
    type: 'registered',
    userId: { _id: `u${i + 1}`, name: NAMES[i % NAMES.length]! },
    joinedAt: '2026-10-05T09:00:00.000Z',
    team: null,
    position: i === 0 ? 'goalkeeper' : undefined,
  })),
  {
    _id: 'p16',
    eventId: eventDetailFixture._id,
    type: 'guest',
    guestName: 'Ko Aung',
    addedByUserId: { _id: 'u1', name: 'Nay Paing' },
    joinedAt: '2026-10-06T09:00:00.000Z',
    team: null,
  },
];
