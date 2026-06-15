import { useEffect, useMemo, useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAllBookings } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function PaymentPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchAllBookings()
        setBookings(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load bookings'))
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    void loadBookings()
  }, [])

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const query = search.trim().toLowerCase()
        if (!query) return true
        return (
          String(booking?.user?.name || booking?.user?.full_name || '').toLowerCase().includes(query) ||
          String(booking?.user?.email || '').toLowerCase().includes(query) ||
          String(booking?.trip?.from || '').toLowerCase().includes(query) ||
          String(booking?.trip?.to || '').toLowerCase().includes(query)
        )
      }),
    [bookings, search],
  )

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Orders"
        title="Booking management"
        description="Review all bookings, customer details, and booking status from the admin workspace."
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer or destination"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="Bookings will appear here once users begin confirming packages."
        />
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
                        <ClipboardList className="h-3.5 w-3.5" />
                        #{booking.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{booking.user?.name || booking.user?.full_name || 'Unknown user'}</div>
                      <div className="text-sm text-slate-500">{booking.user?.email || 'No email found'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">
                        {booking.trip?.from || 'Unknown'} → {booking.trip?.to || 'Destination'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {booking.trip?.duration || 0} days, ${Number(booking.trip?.price || 0).toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status || 'confirmed'}>{booking.status || 'confirmed'}</StatusBadge>
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

