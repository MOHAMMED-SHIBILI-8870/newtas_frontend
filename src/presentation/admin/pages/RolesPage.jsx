import { useMemo } from 'react'
import { ShieldCheck, KeyRound, Users2 } from 'lucide-react'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import { ROLE_PERMISSION_MAP } from '../../../domain/constants/permissions'
import DataTable from '../../../components/DataTable'

const roleRows = Object.entries(ROLE_PERMISSION_MAP).map(([role, permissions]) => ({
  role,
  permissions,
  permissionCount: permissions.includes('*') ? 'all' : permissions.length,
}))

export default function RolesPage() {
  const metrics = useMemo(
    () => [
      { label: 'Roles', value: roleRows.length, helper: 'Configured access groups', icon: Users2, tone: 'yellow' },
      {
        label: 'Permission buckets',
        value: roleRows.reduce((total, item) => total + (item.permissionCount === 'all' ? 1 : Number(item.permissionCount)), 0),
        helper: 'Role-specific capabilities',
        icon: ShieldCheck,
        tone: 'cyan',
      },
      { label: 'Admin override', value: 'Yes', helper: 'Wildcard access enabled', icon: KeyRound, tone: 'emerald' },
    ],
    [],
  )

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="RBAC"
        title="Roles and permissions"
        description="Review the default role matrix used by the frontend for route visibility and guarded actions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <AdminKpiCard key={metric.label} {...metric} />
        ))}
      </div>

      <AdminChartCard
        eyebrow="Access matrix"
        title="Permission summary"
        description="The table below shows the default permission bundles for each role."
      >
        <DataTable
          title="Role matrix"
          description="This is the client-side view of the current RBAC map. Adjust the map in `src/domain/constants/permissions.js` when backend permissions change."
          rows={roleRows}
          rowKey="role"
          searchPlaceholder="Search roles or permissions"
          searchKeys={['role', 'permissions']}
          columns={[
            {
              key: 'role',
              label: 'Role',
              render: (row) => <span className="font-semibold text-slate-950">{row.role}</span>,
            },
            {
              key: 'permissionCount',
              label: 'Permissions',
              render: (row) => (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
                  {row.permissionCount === 'all' ? 'All permissions' : `${row.permissionCount} permissions`}
                </span>
              ),
            },
            {
              key: 'permissions',
              label: 'Permission set',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  {row.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-yellow-700"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
          loading={false}
          emptyState={<div className="px-6 py-12 text-center text-slate-500">No roles configured.</div>}
        />
      </AdminChartCard>
    </div>
  )
}

