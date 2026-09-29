import { useState } from 'react';
import { IconMapPin } from '@/components/ui/icons';
import ListPage, { StatusBadge } from '@/components/ui/ListPage';

interface Region {
  id: string;
  name: string;
  country: string;
  status: 'Active' | 'Inactive';
}

const STATUSES = ['Active', 'Inactive'] as const;

// Local seed data — swap for an API query once the backend endpoint exists.
const SEED: Region[] = [
  { id: 'RG-001', name: 'Yangon', country: 'Myanmar', status: 'Active' },
  { id: 'RG-002', name: 'Mandalay', country: 'Myanmar', status: 'Active' },
  { id: 'RG-003', name: 'Naypyidaw', country: 'Myanmar', status: 'Inactive' },
];

export default function RegionsPage() {
  const [rows, setRows] = useState<Region[]>(SEED);

  return (
    <ListPage
      title="Regions"
      itemLabel="Region"
      icon={IconMapPin}
      emptyText="No regions yet"
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        { header: 'ID', render: (r) => r.id, className: 'text-slate-400' },
        { header: 'Name', render: (r) => r.name, className: 'font-medium text-ink' },
        { header: 'Country', render: (r) => r.country || '—' },
        { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Yangon' },
        { name: 'country', label: 'Country', placeholder: 'e.g. Myanmar' },
        { name: 'status', label: 'Status', type: 'select', options: STATUSES },
      ]}
      onAdd={(v) =>
        setRows((prev) => [
          ...prev,
          {
            id: `RG-${String(prev.length + 1).padStart(3, '0')}`,
            name: v.name,
            country: v.country,
            status: v.status as Region['status'],
          },
        ])
      }
    />
  );
}
