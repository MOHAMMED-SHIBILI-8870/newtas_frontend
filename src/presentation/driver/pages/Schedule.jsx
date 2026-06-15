import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, Clock, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverTrips } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Schedule() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await fetchDriverTrips()
        setTrips(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to fetch schedule'))
      } finally {
        setLoading(false)
      }
    }
    void loadSchedule()
  }, [])

  const todayStr = new Date().toDateString()

  const todayTrips = trips.filter((t) => {
    if (!t.start_date) return false
    return new Date(t.start_date).toDateString() === todayStr
  })

  const upcomingTrips = trips.filter((t) => {
    if (!t.start_date) return false
    const d = new Date(t.start_date)
    return d.toDateString() !== todayStr && d.getTime() > new Date().getTime()
  })

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="My Schedule"
        title="Your Dispatch Calendar"
        description="Stay on track with today's dispatches and upcoming reservations."
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
          <Loader2 className="animate-spin" />
          <span>Loading schedules...</span>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Today's Schedule */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Today's Trips</h3>
                <p className="text-xs text-white/50">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-4">
              {todayTrips.length > 0 ? (
                todayTrips.map((trip) => (
                  <div key={trip.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">Booking #{trip.id}</p>
                      <p className="text-xs text-white/60">{trip.trip?.from} to {trip.trip?.to}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase text-yellow-400">
                        <Clock size={12} /> {trip.status}
                      </span>
                    </div>
                    <Link
                      to={`/driver/trips/${trip.id}`}
                      className="rounded-xl bg-white/5 p-2 text-white hover:bg-white/10 transition"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-white/40 font-medium">
                  No trips scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Upcoming Trips</h3>
                <p className="text-xs text-white/50">Future dispatches</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingTrips.length > 0 ? (
                upcomingTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">Booking #{trip.id}</p>
                      <p className="text-xs text-white/60">{trip.trip?.from} to {trip.trip?.to}</p>
                      <p className="text-xs font-semibold text-white/40 mt-1">
                        Starts: {new Date(trip.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/driver/trips/${trip.id}`}
                      className="rounded-xl bg-white/5 p-2 text-white hover:bg-white/10 transition"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-white/40 font-medium">
                  No upcoming scheduled trips.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
