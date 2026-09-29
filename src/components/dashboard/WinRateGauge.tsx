import { IconDots } from '@/components/ui/icons';
import { winRate } from '@/services/dashboard/fixtures';

const SIZE = 160;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = Math.PI * RADIUS; // half circle

export default function WinRateGauge() {
  const progress = Math.min(winRate.percent / 100, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink">Win Rate</p>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="More options"
        >
          <IconDots className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <svg width={SIZE} height={SIZE / 2 + STROKE / 2} viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE / 2}`}>
          <path
            d={`M ${STROKE / 2} ${SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
            fill="none"
            stroke="var(--color-pitch-100)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d={`M ${STROKE / 2} ${SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
            fill="none"
            stroke="var(--color-pitch-600)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="-mt-8 text-center">
          <p className="text-3xl font-semibold text-ink">{winRate.percent}%</p>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          On track for {winRate.target}% target
        </p>
      </div>
    </div>
  );
}
