import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  MapPin,
  Truck,
  Calendar,
  CheckCircle,
  PlayCircle,
  Flag,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverTripByID, updateTripStatus } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'

export default function TripDetails() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadTrip = async () => {
    try {
      const data = await fetchDriverTripByID(id)
      setTrip(data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to fetch trip details'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTrip()
  }, [id])

  const handleStatusUpdate = async (newStatus) => {
    try {
      setSubmitting(true)
      await updateTripStatus(id, { status: newStatus })
      toast.success(`Trip status updated to: ${newStatus}`)
      await loadTrip()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update trip status'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
        <Loader2 className="animate-spin" />
        <span>Loading trip details...</span>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-white/60">Trip not found or not assigned to you.</p>
        <Link to="/driver/trips" className="text-yellow-400 hover:underline">
          Go back to assigned trips
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/driver/trips"
          className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back to Assigned Trips
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Trip Management</h1>
            <p className="text-white/50 text-sm">Booking Reference #{trip.id}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wider ${
                trip.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : trip.status === 'started' || trip.status === 'ongoing'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}
            >
              Status: {trip.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Customer Details</h3>
              <p className="text-xs text-white/50">Passenger contact</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-white/40 block text-xs">Full Name</span>
              <span className="font-semibold text-white">{trip.user?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-xs">Email Address</span>
              <span className="font-semibold text-white">{trip.user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-xs">Total Seats Reserved</span>
              <span className="font-semibold text-white">{trip.seats_booked} seats</span>
            </div>
          </div>
        </div>

        {/* Trip Info Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Itinerary Details</h3>
              <p className="text-xs text-white/50">Locations & Dates</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-white/40 block text-xs">From Location</span>
              <span className="font-semibold text-white">{trip.trip?.from || 'N/A'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-xs">To Destination</span>
              <span className="font-semibold text-white">{trip.trip?.to || 'N/A'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-xs">Start Date</span>
              <span className="font-semibold text-white">
                {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-white/40 block text-xs">End Date</span>
              <span className="font-semibold text-white">
                {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Info Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Assigned Vehicle</h3>
              <p className="text-xs text-white/50">Car, SUV, or Van</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {trip.vehicle ? (
              <>
                <div>
                  <span className="text-white/40 block text-xs">Vehicle Name</span>
                  <span className="font-semibold text-white">{trip.vehicle.name}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-xs">Vehicle Type</span>
                  <span className="font-semibold text-white">{trip.vehicle.type}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-xs">Total Seats</span>
                  <span className="font-semibold text-white">{trip.vehicle.total_seats} seats</span>
                </div>
              </>
            ) : (
              <p className="text-white/50">No vehicle details linked directly to this booking.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action panel to update statuses */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">Trip Status Control</h3>
        <p className="text-white/50 text-sm mb-6 max-w-lg mx-auto">
          Update the passenger and operational hubs with the current status of this trip. Please update sequentially as you perform operations.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            disabled={submitting || trip.status === 'started' || trip.status === 'ongoing' || trip.status === 'completed'}
            onClick={() => handleStatusUpdate('started')}
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
            Start Trip
          </button>

          <button
            type="button"
            disabled={submitting || trip.status === 'arrived' || trip.status === 'completed'}
            onClick={() => handleStatusUpdate('arrived')}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Flag size={18} />}
            Mark Arrived
          </button>

          <button
            type="button"
            disabled={submitting || trip.status === 'completed'}
            onClick={() => handleStatusUpdate('completed')}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            Complete Trip
          </button>
        </div>
      </div>
    </div>
  )
}
