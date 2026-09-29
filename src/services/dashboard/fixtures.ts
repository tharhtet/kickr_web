/**
 * Static mock data for the dashboard screen. Swap for real `useQuery` calls
 * once the backend exposes tournament/group/stat endpoints — see
 * `profileApi` for the mock/live split pattern to follow.
 */

export interface StatCardData {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  hint: string;
}

export const statCards: StatCardData[] = [
  {
    label: 'Upcoming Matches',
    value: '12',
    delta: '8.4%',
    trend: 'up',
    hint: 'vs 11 last period',
  },
  {
    label: 'Active Tournaments',
    value: '6',
    delta: '15.5%',
    trend: 'up',
    hint: 'vs 5 last period',
  },
  {
    label: 'Group Members',
    value: '248',
    delta: '4.4%',
    trend: 'up',
    hint: 'vs 238 last period',
  },
  {
    label: 'Win Rate',
    value: '68%',
    delta: '2.1%',
    trend: 'down',
    hint: 'vs 70% last period',
  },
];

/** Points earned per week, last 8 weeks. */
export const performanceSeries: { label: string; value: number }[] = [
  { label: 'W1', value: 12 },
  { label: 'W2', value: 18 },
  { label: 'W3', value: 15 },
  { label: 'W4', value: 24 },
  { label: 'W5', value: 21 },
  { label: 'W6', value: 30 },
  { label: 'W7', value: 26 },
  { label: 'W8', value: 34 },
];

export const performanceTotal = {
  value: '1,284 pts',
  delta: '24.4%',
  trend: 'up' as const,
};

/** Matches played per weekday, current month. */
export const weeklyActivity: { day: string; value: number }[] = [
  { day: 'Sun', value: 6 },
  { day: 'Mon', value: 2 },
  { day: 'Tue', value: 3 },
  { day: 'Wed', value: 4 },
  { day: 'Thu', value: 3 },
  { day: 'Fri', value: 5 },
  { day: 'Sat', value: 9 },
];

export const groupsBreakdown = {
  total: 248,
  segments: [
    { label: 'Public', value: 148, color: 'bg-pitch-500' },
    { label: 'Private', value: 72, color: 'bg-sky-500' },
    { label: 'Invite-only', value: 28, color: 'bg-amber-500' },
  ],
};

export const winRate = {
  percent: 68,
  target: 75,
};

export const nextTournament = {
  name: 'Yangon 6-a-side Cup',
  date: 'Oct 4, 2026',
  teams: 12,
  venue: 'Kandawgyi Pitch 2',
};

export interface TournamentRow {
  id: string;
  name: string;
  date: string;
  teams: number;
  status: 'Open' | 'Full' | 'In progress';
}

export const upcomingTournaments: TournamentRow[] = [
  { id: '#TR-2091', name: 'Yangon 6-a-side Cup', date: 'Oct 4, 2026', teams: 12, status: 'Open' },
  { id: '#TR-2088', name: 'Futsal Night League', date: 'Oct 9, 2026', teams: 8, status: 'Open' },
  { id: '#TR-2081', name: 'Junction City Arena Classic', date: 'Oct 12, 2026', teams: 16, status: 'Full' },
  { id: '#TR-2076', name: 'Weekend Warriors Shield', date: 'Oct 18, 2026', teams: 10, status: 'Open' },
  { id: '#TR-2070', name: 'Inya Lake 5s', date: 'Sep 30, 2026', teams: 6, status: 'In progress' },
];
