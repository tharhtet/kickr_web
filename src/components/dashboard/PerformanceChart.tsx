import { IconDots, IconTrendUp } from '@/components/ui/icons';
import { performanceSeries, performanceTotal } from '@/services/dashboard/fixtures';

const WIDTH = 560;
const HEIGHT = 160;
const PADDING = 8;

function buildPath(values: number[]): { line: string; area: string } {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (WIDTH - PADDING * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = PADDING + i * stepX;
    const y = PADDING + (1 - (v - min) / range) * (HEIGHT - PADDING * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${line} L${points[points.length - 1][0]},${HEIGHT} L${points[0][0]},${HEIGHT} Z`;

  return { line, area };
}

export default function PerformanceChart() {
  const values = performanceSeries.map((p) => p.value);
  const { line, area } = buildPath(values);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Performance</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{performanceTotal.value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-pitch-700">
            <IconTrendUp className="h-3.5 w-3.5" />
            {performanceTotal.delta} vs last period
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="More options"
        >
          <IconDots className="h-4 w-4" />
        </button>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 h-40 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-pitch-500)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-pitch-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#perf-fill)" />
        <path d={line} fill="none" stroke="var(--color-pitch-600)" strokeWidth="2.5" />
      </svg>

      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {performanceSeries.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
