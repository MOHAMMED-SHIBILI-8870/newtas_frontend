import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverTrips } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const loadTripsData = async () => {
    try {
      const data = await fetchDriverTrips()
      setTrips(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to fetch assigned trips'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTripsData()
  }, [])

  const filteredTrips = trips.filter((trip) => {
    const fromLocation = trip.trip?.from || ''
    const toLocation = trip.trip?.to || ''
    const customerName = trip.user?.name || ''
    const customerEmail = trip.user?.email || ''
    const status = trip.status || ''

    const matchesSearch =
      fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Assigned Trips"
        title="Manage Your Trips"
        description="View and update your assigned trip schedules and progress dispatches."
      />

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search by customer name, email, or locations..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 outline-none text-white transition focus:ring-2 focus:ring-yellow-400/20 placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm font-semibold text-white/80 outline-none focus:ring-2 focus:ring-yellow-400/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="pending">Pending</option>
          <option value="started">Started</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
            <Loader2 className="animate-spin" />
            <span>Loading assigned trips...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-white/45">
                  <th className="px-6 py-4">Trip Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Seats</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm text-white/80">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div>Booking #{trip.id}</div>
                        <div className="text-xs font-normal text-white/50">{trip.trip?.from} to {trip.trip?.to}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{trip.user?.name || 'N/A'}</div>
                        <div className="text-xs text-white/55">{trip.user?.email}</div>
                      </td>

                      <td className="px-6 py-4 font-bold text-white/95">
                        {trip.seats_booked} {trip.seats_booked === 1 ? 'seat' : 'seats'}
                      </td>

                      <td className="px-6 py-4">
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            trip.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : trip.status === 'started' || trip.status === 'ongoing'
                              ? 'bg-sky-500/10 text-sky-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/driver/trips/${trip.id}`}
                          className="inline-flex items-center gap-1 justify-center rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
                        >
                          Manage <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-white/40 font-medium">
                      No assigned trips found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
