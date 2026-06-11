import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleX, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { approveAiTripRequest, fetchAdminAiTripRequests, rejectAiTripRequest } from '../../../infrastructure/api/aiApi'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function AIApprovalPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState({})

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchAdminAiTripRequests()
        setRequests(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load AI requests'))
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    void loadRequests()
  }, [])

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const query = search.trim().toLowerCase()
        if (!query) return true
        return (
          String(request?.from || '').toLowerCase().includes(query) ||
          String(request?.to || '').toLowerCase().includes(query) ||
          String(request?.status || '').toLowerCase().includes(query) ||
          String(request?.user?.email || '').toLowerCase().includes(query) ||
          String(request?.user?.full_name || '').toLowerCase().includes(query)
        )
      }),
    [requests, search],
  )

  const handleReview = async (requestId, action) => {
    const note = notes[requestId] || ''
    const apiCall = action === 'approve' ? approveAiTripRequest : rejectAiTripRequest

    const toastId = toast.loading(action === 'approve' ? 'Approving request...' : 'Rejecting request...')

    try {
      const response = await apiCall(requestId, { admin_note: note })
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? { ...request, ...response } : request)),
      )
      toast.success(action === 'approve' ? 'AI request approved' : 'AI request rejected', { id: toastId })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to review AI request'), { id: toastId })
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="AI requests"
        title="AI trip approval queue"
        description="Approve or reject generated trip requests and let the backend create live packages on approval."
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user, destination, or status"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading AI requests..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No AI requests found"
          description="When users send generated plans for review, they will appear here with approve/reject controls."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredRequests.map((request) => (
            <article key={request.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">AI request #{request.id}</p>
                  <h3 className="mt-2 text-3xl font-black text-slate-950">
                    {request.from} → {request.to}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Submitted by {request.user?.full_name || request.user?.email || 'Unknown user'}
                  </p>
                </div>
                <StatusBadge status={request.status || 'pending'}>{request.status || 'pending'}</StatusBadge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Meta label="Days" value={request.days} />
                <Meta label="Trip type" value={request.trip_type} />
                <Meta label="Budget" value={request.budget_level} />
                <Meta label="Hotel" value={request.hotel_type} />
              </div>

              <div className="mt-5 rounded-[28px] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Admin note</p>
                <textarea
                  value={notes[request.id] || ''}
                  onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                  className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  placeholder="Optional note for the reviewer or user"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleReview(request.id, 'approve')}
                  disabled={request.status !== 'pending'}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void handleReview(request.id, 'reject')}
                  disabled={request.status !== 'pending'}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CircleX className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

const Meta = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-950">{value ?? 'N/A'}</p>
  </div>
)

