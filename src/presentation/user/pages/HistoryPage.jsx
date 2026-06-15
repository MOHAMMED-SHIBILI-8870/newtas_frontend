import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchMyBookings } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import { createReview } from '../../../services/reviewsService'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { Star } from 'lucide-react'

export default function HistoryPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewTripId, setReviewTripId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const handleOpenReview = (tripId) => {
    setReviewTripId(tripId)
    setRating(5)
    setComment('')
    setReviewModalOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewTripId) return
    setSubmittingReview(true)
    try {
      await createReview({
        trip_id: reviewTripId,
        rating: rating,
        comment: comment
      })
      toast.success('Review submitted successfully!')
      setReviewModalOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit review'))
    } finally {
      setSubmittingReview(false)
    }
  }

  // isCompleted check removed to allow reviewing at any time

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
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <StatusBadge status={booking.status || 'confirmed'}>{booking.status || 'confirmed'}</StatusBadge>
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleOpenReview(booking.trip_id)}
                      className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-black text-slate-950">Leave a Review</h2>
            <p className="mt-2 text-sm text-slate-500">Rate your experience and let us know how we did.</p>
            
            <div className="mt-6 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your trip... (optional)"
              className="mt-6 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              rows={4}
            />

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 rounded-full bg-slate-100 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 rounded-full bg-cyan-600 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

