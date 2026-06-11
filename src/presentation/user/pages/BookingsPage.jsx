import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Search, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchMyBookings } from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchMyBookings()
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
          String(booking?.trip?.from || '').toLowerCase().includes(query) ||
          String(booking?.trip?.to || '').toLowerCase().includes(query) ||
          String(booking?.payment_status || '').toLowerCase().includes(query) ||
          String(booking?.status || '').toLowerCase().includes(query)
        )
      }),
    [bookings, search],
  )

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Bookings"
        title="My bookings"
        description="Track every package you have booked, review status, and jump back to the trip details page."
        action={
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <CalendarDays className="h-4 w-4" />
            Browse packages
          </Link>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bookings by destination, booking status, or payment status"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading your bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book a package and it will appear here with the latest status and trip details."
          action={
            <Link
              to="/packages"
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              View packages
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredBookings.map((booking) => (
            <article key={booking.id} className="flex flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">Booking #{booking.id}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      {booking.trip?.from || 'Unknown'} → {booking.trip?.to || 'Unknown'}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={booking.status || 'pending_payment'}>
                      {booking.status?.replace('_', ' ') || 'pending payment'}
                    </StatusBadge>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      booking.payment_status === 'fully_paid' ? 'bg-green-50 text-green-700' :
                      booking.payment_status === 'advance_paid' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {booking.payment_status || 'Unpaid'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SummaryRow label="Schedule" value={booking.start_date && booking.end_date ? `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}` : 'TBD'} />
                  <SummaryRow label="Seats Booked" value={`${booking.seats_booked || 1} Seats`} />
                  <SummaryRow label="Total Value" value={`₹${Number(booking.final_amount || 0).toLocaleString('en-IN')}`} />
                  <SummaryRow 
                    label="Balance Due" 
                    value={`₹${Number(booking.balance_amount || 0).toLocaleString('en-IN')}`} 
                    highlight={booking.balance_amount > 0 && booking.payment_status === 'advance_paid'}
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Plans</p>
                  {Array.isArray(booking.custom_plans) && booking.custom_plans.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {booking.custom_plans.slice(0, 2).map((plan) => (
                        <div key={plan.id || `${plan.day_number}-${plan.title}`} className="rounded-xl bg-white p-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-slate-950">Day {plan.day_number}</p>
                            <span className="text-xs font-bold text-slate-400">{plan.location || 'General'}</span>
                          </div>
                          <p className="mt-1 text-slate-600 line-clamp-1">{plan.title}</p>
                        </div>
                      ))}
                      {booking.custom_plans.length > 2 && (
                        <p className="text-xs text-center text-slate-400 font-medium pt-1">
                          + {booking.custom_plans.length - 2} more days in itinerary
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No custom plans attached to this booking.</p>
                  )}
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                {booking.payment_status !== 'fully_paid' ? (
                  <button
                    onClick={() => navigate(`/payment/${booking.id}`)}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 active:scale-[0.98]"
                  >
                    <CreditCard className="h-4 w-4" />
                    {booking.payment_status === 'advance_paid' ? 'Pay Remaining Balance' : 'Proceed to Payment'}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                    ✓ Order Fully Cleared
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

const SummaryRow = ({ label, value, highlight }) => (
  <div className={`rounded-2xl p-4 transition ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className={`mt-2 text-sm font-black ${highlight ? 'text-amber-700' : 'text-slate-950'}`}>{value}</p>
  </div>
)