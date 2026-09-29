import { IconCalendar, IconTrophy, IconUsers } from '@/components/ui/icons';
import { nextTournament } from '@/services/dashboard/fixtures';

export default function NextTournamentCard() {
  return (
    <div className="rounded-2xl border border-pitch-200 bg-[linear-gradient(160deg,var(--color-pitch-600),var(--color-pitch-700))] p-5 text-white">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-pitch-100 uppercase">
        <IconTrophy className="h-4 w-4" />
        Next tournament
      </div>
      <p className="mt-3 text-lg font-semibold">{nextTournament.name}</p>
      <p className="text-sm text-pitch-100">{nextTournament.venue}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-pitch-50">
        <span className="flex items-center gap-1.5">
          <IconCalendar className="h-4 w-4" />
          {nextTournament.date}
        </span>
        <span className="flex items-center gap-1.5">
          <IconUsers className="h-4 w-4" />
          {nextTournament.teams} teams
        </span>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
      >
        View details
      </button>
    </div>
  );
}
