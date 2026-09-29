import { IconUsers } from '@/components/ui/icons';

/** Placeholder route — scaffolded, not yet built out. */
export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold text-ink">Group List</h1>
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
        <IconUsers className="h-10 w-10 text-pitch-400" />
        <p className="mt-3 text-sm font-medium text-ink">Your groups will show up here</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Manage members, invitations, and roles for every group you belong to.
        </p>
      </div>
    </div>
  );
}
