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

      <div className="rounded-[28px] border border-white/10 bg-zinc-950/60 p-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user, destination, or status..."
            className="w-full rounded-2xl border border-white/10 bg-black py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-yellow-400/80"
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
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950/60 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Parameters</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 min-w-[200px]">Admin Note</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90 bg-transparent">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="transition hover:bg-white/5">
                    <td className="p-4 font-mono font-bold text-white/45">#{request.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{request.from}</div>
                      <div className="mt-0.5 text-xs text-yellow-300 font-bold">→ {request.to}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {request.user?.full_name || request.user?.email || 'Unknown User'}
                      </div>
                      <div className="text-xs text-white/55">{request.user?.email || 'No email'}</div>
                    </td>
                    <td className="p-4 space-y-0.5 text-xs text-white/80">
                      <div><span className="text-white/40">Duration:</span> {request.days} days</div>
                      <div><span className="text-white/40">Type:</span> {request.trip_type}</div>
                      <div><span className="text-white/40">Budget:</span> {request.budget_level}</div>
                      <div><span className="text-white/40">Hotel:</span> {request.hotel_type}</div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={request.status || 'pending'}>{request.status || 'pending'}</StatusBadge>
                    </td>
                    <td className="p-4">
                      <textarea
                        value={notes[request.id] || ''}
                        onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                        className="min-h-12 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white outline-none transition focus:border-yellow-400/80 placeholder-white/30"
                        placeholder="Add review feedback..."
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => void handleReview(request.id, 'approve')}
                          disabled={request.status !== 'pending'}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Approve plan"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleReview(request.id, 'reject')}
                          disabled={request.status !== 'pending'}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Reject plan"
                        >
                          <CircleX className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

