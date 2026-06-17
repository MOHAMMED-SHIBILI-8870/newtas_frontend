import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ShieldCheck, Sparkles, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { PencilIcon } from 'lucide-react'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import { getTripByName, bookTrip } from '../../../infrastructure/api/tripService'
import { useAuth } from '../../../domain/context/AuthContext'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function TripDetailsPage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [seats, setSeats] = useState(1)

  const originalPrice = useMemo(() => {
    if (!trip) return 0
    let base = 0
    if (trip.pricing_tiers && trip.pricing_tiers.length > 0) {
      const tier = trip.pricing_tiers.find(t => t.members === seats)
      if (tier) base = tier.price
    }
    if (base === 0) base = Number(trip.price || 0) * seats
    return base
  }, [trip, seats])

  const displayedPrice = useMemo(() => {
    if (!trip) return 0
    const base = originalPrice
    if (trip.group_discount_threshold > 0 && seats >= trip.group_discount_threshold) {
       const discount = (base * (trip.group_discount_percent || 0)) / 100
       return base - discount
    }
    return base
  }, [trip, seats, originalPrice])

  const chosenDuration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const data = await getTripByName(name)
        setTrip(data || null)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load trip details'))
        setTrip(null)
      } finally {
        setLoading(false)
      }
    }

    void loadTrip()
  }, [name])

  const plans = useMemo(() => {
    if (!Array.isArray(trip?.plans)) return [];
    if (chosenDuration > 0) {
      return trip.plans.filter(p => p.day_number <= chosenDuration);
    }
    return trip.plans;
  }, [trip, chosenDuration])

  const handleBookTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/packages/${name}` } })
      return
    }

    if (isAdmin) {
      toast.error('Admins cannot book trips')
      return
    }

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date must be after start date')
      return
    }

    try {
      setBooking(true)
      const result = await bookTrip(trip.id, {
        start_date: startDate,
        end_date: endDate,
        seats: seats,
      })

      toast.success(result?.message || 'Trip booked successfully')

      // booking id returned from backend
      const bookingId =
        result?.booking?.id ||
        result?.data?.id ||
        result?.id

      navigate(`/booking/${bookingId}/verify`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to book trip'))
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading trip details..." />
  }

  if (!trip) {
    return (
      <EmptyState
        title="Trip not found"
        description="The package may have been removed or the URL may be incorrect."
        action={
          <Link
            to="/packages"
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to packages
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="relative h-96">
            <img
              src={trip.image_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80'}
              alt={`${trip.from} to ${trip.to}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <StatusBadge status={trip.status || 'active'} className="bg-white/10 text-white ring-white/10">
                {trip.status || 'active'}
              </StatusBadge>
              <h1 className="mt-4 text-4xl font-black">
                {trip.from} to {trip.to}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                {trip.trip_type || 'Family'} package with polished logistics, flexible travel options, and a clear
                itinerary.
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 p-6 sm:grid-cols-3">
            <InfoTile icon={CalendarDays} label="Duration" value={`${trip.duration || 1} days`} />
            <InfoTile icon={Users} label="Members" value={`${trip.members || 1}`} />
            <InfoTile icon={ShieldCheck} label="Hotel" value={trip.hotel_type || '3 Star'} />
          </div>

          <div className="border-t border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-950">Itinerary</h2>
            <div className="prose prose-slate mt-4 max-w-none">
              <ReactMarkdown>{trip.itinerary_raw || 'No itinerary text was provided.'}</ReactMarkdown>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">Trip summary</p>
            <div className="flex items-baseline gap-3 mt-2">
              <h2 className="text-3xl font-black text-slate-950">${Number(displayedPrice).toFixed(0)}</h2>
              {originalPrice > displayedPrice && (
                <span className="text-lg font-semibold text-slate-400 line-through">${Number(originalPrice).toFixed(0)}</span>
              )}
            </div>
            {originalPrice > displayedPrice && (
              <p className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">
                {trip.group_discount_percent}% Group Discount Applied!
              </p>
            )}
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <SummaryRow label="Budget level" value={trip.budget_level || 'Medium'} />
              <SummaryRow label="Transport" value={trip.transport || 'Car'} />
              <SummaryRow label="Children" value={trip.children ?? 0} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      setStartDate(newStartDate);
                      if (newStartDate && trip?.duration) {
                        const start = new Date(newStartDate);
                        start.setDate(start.getDate() + (trip.duration - 1));
                        setEndDate(start.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    disabled
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Number of Members</label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white"
                  >
                    {Array.from({ length: trip.members || 10 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Member' : 'Members'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBookTrip}
                  disabled={booking || isAdmin}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {booking ? 'Booking...' : isAuthenticated ? 'Book this trip' : 'Login to book'}
                </button>
              </div>
            </div>

            {!isAuthenticated ? (
              <p className="mt-3 text-center text-xs text-slate-500">
                You will be redirected to sign in before booking.
              </p>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Daily plan</h3>
            {plans.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                No day-by-day plans were attached to this package.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id || `${plan.day_number}-${plan.title}`} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
                          Day {plan.day_number}
                        </p>
                        <h4 className="mt-1 text-base font-bold text-slate-950">{plan.title}</h4>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{plan.category || 'General'}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {plan.location ? <Tag>{plan.location}</Tag> : null}
                      {plan.start_time ? <Tag>{plan.start_time}</Tag> : null}
                      {plan.end_time ? <Tag>{plan.end_time}</Tag> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  </div>
)

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-950">{value}</span>
  </div>
)

const Tag = ({ children }) => (
  <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 shadow-sm">{children}</span>
)
