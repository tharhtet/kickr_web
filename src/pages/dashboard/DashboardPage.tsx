import { IconChevronDown, IconPlus } from '@/components/ui/icons';
import GroupsBreakdown from '@/components/dashboard/GroupsBreakdown';
import NextTournamentCard from '@/components/dashboard/NextTournamentCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import StatCard from '@/components/dashboard/StatCard';
import UpcomingTournaments from '@/components/dashboard/UpcomingTournaments';
import WeeklyActivityChart from '@/components/dashboard/WeeklyActivityChart';
import WinRateGauge from '@/components/dashboard/WinRateGauge';
import { statCards } from '@/services/dashboard/fixtures';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 sm:flex"
          >
            Last 30 days
            <IconChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700"
          >
            <IconPlus className="h-4 w-4" />
            New Tournament
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <PerformanceChart />
          <GroupsBreakdown />
        </div>
        <div className="space-y-4">
          <WeeklyActivityChart />
          <WinRateGauge />
          <NextTournamentCard />
        </div>
      </div>

      <div className="mt-4">
        <UpcomingTournaments />
      </div>
    </div>
  );
}
