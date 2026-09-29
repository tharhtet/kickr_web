import { IconTrendDown, IconTrendUp } from '@/components/ui/icons';
import type { StatCardData } from '@/services/dashboard/fixtures';

export default function StatCard({ label, value, delta, trend, hint }: StatCardData) {
  const isUp = trend === 'up';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <span
          className={[
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
            isUp ? 'bg-pitch-100 text-pitch-700' : 'bg-red-50 text-red-600',
          ].join(' ')}
        >
          {isUp ? <IconTrendUp className="h-3 w-3" /> : <IconTrendDown className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
