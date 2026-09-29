import { IconDots } from '@/components/ui/icons';
import { weeklyActivity } from '@/services/dashboard/fixtures';

export default function WeeklyActivityChart() {
  const max = Math.max(...weeklyActivity.map((d) => d.value));
  const peak = weeklyActivity.reduce((a, b) => (b.value > a.value ? b : a));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink">Weekly Match Activity</p>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="More options"
        >
          <IconDots className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-2xl font-semibold text-ink">{peak.value} matches</p>
      <p className="text-xs text-slate-400">Busiest day: {peak.day}</p>

      <div className="mt-5 flex h-32 items-end justify-between gap-2">
        {weeklyActivity.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={[
                'w-full rounded-md transition-all',
                d.day === peak.day ? 'bg-pitch-600' : 'bg-slate-100',
              ].join(' ')}
              style={{ height: `${Math.max((d.value / max) * 100, 6)}%` }}
            />
            <span
              className={[
                'text-xs',
                d.day === peak.day ? 'font-semibold text-pitch-700' : 'text-slate-400',
              ].join(' ')}
            >
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
