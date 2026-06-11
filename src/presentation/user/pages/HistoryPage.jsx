import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchMyBookings } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function HistoryPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchMyBookings()
        setBookings(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load booking history'))
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    void loadBookings()
  }, [])

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()),
    [bookings],
  )

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="History"
        title="Booking history"
        description="A chronological view of your previous and current bookings."
      />

      {loading ? (
        <LoadingState label="Loading booking history..." />
      ) : sortedBookings.length === 0 ? (
        <EmptyState
          title="No history available"
          description="Your booking history will appear here after your first confirmed booking."
        />
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <article key={booking.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                    {booking.start_date && booking.end_date ? `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}` : 'TBD'}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    {booking.trip?.from || 'Unknown'} → {booking.trip?.to || 'Unknown'}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {booking.trip?.duration || 0} days, {booking.trip?.trip_type || 'Trip'}
                  </p>
                </div>
                <StatusBadge status={booking.status || 'confirmed'}>{booking.status || 'confirmed'}</StatusBadge>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

