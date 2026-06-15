import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Handshake, RefreshCw, MessageCircleWarning, UserRoundCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { assignComplaint, fetchAdminComplaints, resolveComplaint } from '../../../services/complaintsService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const normalizeComplaint = (complaint) => ({
  ...complaint,
  title: complaint?.title || complaint?.subject || 'Complaint',
  category: complaint?.category || complaint?.type || 'General',
  status: String(complaint?.status || 'open').toLowerCase(),
  priority: String(complaint?.priority || 'medium').toLowerCase(),
  assignee: complaint?.assignee?.full_name || complaint?.assignee?.email || complaint?.assigned_to || 'Unassigned',
  customer: complaint?.user?.name || complaint?.user?.full_name || complaint?.user?.email || complaint?.customer_name || 'Unknown customer',
})

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const loadComplaints = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const data = await fetchAdminComplaints()
      setComplaints(Array.isArray(data) ? data.map(normalizeComplaint) : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load complaints'))
      setComplaints([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadComplaints()
  }, [])

  const filteredComplaints = useMemo(
    () => complaints.filter((complaint) => statusFilter === 'all' || complaint.status === statusFilter),
    [complaints, statusFilter],
  )

  const openCount = complaints.filter((complaint) => complaint.status === 'open').length
  const inProgressCount = complaints.filter((complaint) => complaint.status === 'in_progress').length
  const resolvedCount = complaints.filter((complaint) => complaint.status === 'resolved').length

  const handleAssign = async (complaint) => {
    const assigneeId = window.prompt('Enter assignee ID')
    if (!assigneeId) {
      return
    }

    try {
      await assignComplaint(complaint.id, { assignee_id: assigneeId, assigned_to: assigneeId })
      toast.success('Complaint assigned')
      await loadComplaints({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign complaint'))
    }
  }

  const handleResolve = async (complaint) => {
    const note = window.prompt('Resolution note', 'Issue resolved by support team')
    if (!note) {
      return
    }

    try {
      await resolveComplaint(complaint.id, { resolution_note: note })
      toast.success('Complaint resolved')
      await loadComplaints({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resolve complaint'))
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Complaints"
        title="Complaint management"
        description="Track open complaints, assignments, and resolution status."
        actions={
          <button
            type="button"
            onClick={() => void loadComplaints({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="Open" value={openCount} helper="Awaiting review" icon={MessageCircleWarning} tone="rose" />
        <AdminKpiCard label="In progress" value={inProgressCount} helper="Being handled" icon={UserRoundCog} tone="yellow" />
        <AdminKpiCard label="Resolved" value={resolvedCount} helper="Closed issues" icon={CheckCircle2} tone="emerald" />
      </div>

      <AdminChartCard eyebrow="Filters" title="Complaint filters" description="Review complaints by status.">
        <label className="min-w-[180px]">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </AdminChartCard>

      {loading ? (
        <AdminChartCard eyebrow="Loading" title="Complaint records">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/45">
            Loading complaint data...
          </div>
        </AdminChartCard>
      ) : (
        <DataTable
          title="Complaint tracker"
          description="Search, filter, export, and update complaint state from the admin dashboard."
          rows={filteredComplaints}
          rowKey="id"
          searchPlaceholder="Search by subject, category, customer, or assignee"
          searchKeys={['title', 'category', 'customer', 'assignee', 'status', 'priority']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All statuses', value: 'all' },
                { label: 'Open', value: 'open' },
                { label: 'In progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Closed', value: 'closed' },
              ],
            },
          ]}
          columns={[
            {
              key: 'title',
              label: 'Complaint',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.title}</p>
                  <p className="text-sm text-slate-500">{row.category}</p>
                </div>
              ),
            },
            {
              key: 'customer',
              label: 'Customer',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.customer}</p>
                  <p className="text-sm text-slate-500">{row.assignee}</p>
                </div>
              ),
            },
            {
              key: 'priority',
              label: 'Priority',
              render: (row) => <span className="font-semibold text-slate-950">{row.priority}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${
                    row.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : row.status === 'in_progress'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAssign(row)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    <Handshake className="h-3.5 w-3.5" />
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResolve(row)}
                    disabled={row.status === 'resolved'}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve
                  </button>
                </div>
              ),
            },
          ]}
          emptyState={
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-950">No complaints found.</p>
              <p className="mt-2 text-sm text-slate-500">Clear filters to see all complaint records.</p>
            </div>
          }
        />
      )}
    </div>
  )
}
