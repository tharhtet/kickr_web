import type { PublicProfile, QrResponse, User } from './types';

/** Mock "current user" returned by the mocked `GET /users/me`. */
export const currentUserFixture: User = {
  _id: '66b0c0ffee0000000000a001',
  name: 'Hein Htet',
  username: 'heinhtet',
  displayName: 'Hein',
  email: 'hein@example.com',
  phoneNumber: '+959770000000',
  height: 176,
  weight: 71,
  profileImage: '',
  emailVerified: true,
  biography: 'Weekend 6-a-side regular. Left wing, occasionally in goal.',
  country: 'mm',
  city: 'yangon',
  dateOfBirth: '1996-04-12',
  sports: ['football', 'futsal'],
  preferredSport: 'football',
  footballPosition: 'forward',
  privacy: {
    profileVisibility: 'public',
    showStats: true,
    showMatchHistory: true,
  },
  inviteCode: 'KICKR-HEIN-2K26',
  highlightVideos: [],
  gallery: [],
  createdAt: '2026-01-04T09:12:00.000Z',
  updatedAt: '2026-08-20T14:03:00.000Z',
};

export const qrFixture: QrResponse = {
  inviteCode: currentUserFixture.inviteCode ?? 'KICKR-HEIN-2K26',
  inviteLink: `http://localhost:3000/u/${currentUserFixture.inviteCode ?? 'KICKR-HEIN-2K26'}`,
};

/** Mock public profile keyed by user id, for `GET /users/:id/profile`. */
export const publicProfileFixtures: Record<string, PublicProfile> = {
  [currentUserFixture._id]: {
    _id: currentUserFixture._id,
    name: currentUserFixture.name,
    username: currentUserFixture.username,
    displayName: currentUserFixture.displayName,
    profileImage: currentUserFixture.profileImage,
    biography: currentUserFixture.biography,
    country: currentUserFixture.country,
    city: currentUserFixture.city,
    sports: currentUserFixture.sports,
    preferredSport: currentUserFixture.preferredSport,
    footballPosition: currentUserFixture.footballPosition,
    statistics: {
      matchesPlayed: 42,
      wins: 0,
      mvpCount: 0,
      avgRating: 0,
    },
    matchHistory: [
      {
        _id: '66b0c0ffee0000000000e001',
        title: 'Sunday 6s @ Kandawgyi',
        date: '2026-08-24T10:00:00.000Z',
        sportType: 'football',
        status: 'completed',
        locationId: {
          _id: '66b0c0ffee0000000000d001',
          name: 'Kandawgyi Pitch 2',
          lat: 16.8285,
          lng: 96.1553,
        },
      },
      {
        _id: '66b0c0ffee0000000000e002',
        title: 'Futsal Night',
        date: '2026-08-18T13:30:00.000Z',
        sportType: 'futsal',
        status: 'completed',
        locationId: {
          _id: '66b0c0ffee0000000000d002',
          name: 'Junction City Arena',
          lat: 16.7812,
          lng: 96.1594,
        },
      },
    ],
  },
};
