import { IconDots } from '@/components/ui/icons';
import { upcomingTournaments, type TournamentRow } from '@/services/dashboard/fixtures';

const STATUS_STYLE: Record<TournamentRow['status'], string> = {
  Open: 'bg-pitch-100 text-pitch-700',
  Full: 'bg-slate-100 text-slate-600',
  'In progress': 'bg-amber-100 text-amber-700',
};

export default function UpcomingTournaments() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Upcoming Tournaments</p>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="More options"
        >
          <IconDots className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs tracking-wide text-slate-400 uppercase">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Teams</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {upcomingTournaments.map((t) => (
              <tr key={t.id}>
                <td className="py-3 text-slate-400">{t.id}</td>
                <td className="py-3 font-medium text-ink">{t.name}</td>
                <td className="py-3 text-slate-500">{t.date}</td>
                <td className="py-3 text-slate-500">{t.teams}</td>
                <td className="py-3">
                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      STATUS_STYLE[t.status],
                    ].join(' ')}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
