import { IconDots } from '@/components/ui/icons';
import { groupsBreakdown } from '@/services/dashboard/fixtures';

export default function GroupsBreakdown() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink">Groups</p>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="More options"
        >
          <IconDots className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {groupsBreakdown.segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={['h-2.5 w-2.5 rounded-full', s.color].join(' ')} />
            <span className="text-lg font-semibold text-ink">{s.value.toLocaleString()}</span>
            <span className="text-sm text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {groupsBreakdown.segments.map((s) => (
          <div
            key={s.label}
            className={s.color}
            style={{ width: `${(s.value / groupsBreakdown.total) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
