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

      <div className="rounded-[28px] border border-white/10 bg-zinc-950/60 p-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer or destination..."
            className="w-full rounded-2xl border border-white/10 bg-black py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-yellow-400/80"
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
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950/60 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-[0.25em] text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                        <ClipboardList className="h-3.5 w-3.5 text-yellow-300" />
                        #{booking.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{booking.user?.name || booking.user?.full_name || 'Unknown user'}</div>
                      <div className="text-sm text-white/55">{booking.user?.email || 'No email found'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {booking.trip?.from || 'Unknown'} → {booking.trip?.to || 'Destination'}
                      </div>
                      <div className="text-sm text-white/55">
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

