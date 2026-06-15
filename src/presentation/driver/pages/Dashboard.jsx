import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverDashboard } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import { SkeletonMetricGrid } from '../../../components/Skeletons'

export default function DriverDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const data = await fetchDriverDashboard()
      setStats(data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard summary'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-16 w-1/3 rounded-2xl bg-white/5 animate-pulse" />
        <SkeletonMetricGrid />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Trips',
      value: stats?.total_trips || 0,
      helper: 'Assigned lifetime trips',
      icon: ClipboardList,
      tone: 'yellow',
    },
    {
      label: 'Active Trips',
      value: stats?.active_trips || 0,
      helper: 'Currently in transit',
      icon: LayoutDashboard,
      tone: 'cyan',
    },
    {
      label: 'Completed Trips',
      value: stats?.completed_trips || 0,
      helper: 'Successfully finished',
      icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      label: 'Upcoming Trips',
      value: stats?.upcoming_trips || 0,
      helper: 'Trips scheduled next',
      icon: Clock,
      tone: 'amber',
    },
  ]

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Welcome Back, Driver Partner"
        description="Here is the overview of your assigned trips, schedule, and current active dispatches."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <AdminKpiCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Trips</h3>
            <p className="text-xs text-white/50">Your most recently updated dispatches and reservations.</p>
          </div>
          <Link
            to="/driver/trips"
            className="inline-flex items-center gap-2 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition"
          >
            View all trips <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/45">
                <th className="pb-4 pr-4">Trip Info</th>
                <th className="pb-4 px-4">Customer</th>
                <th className="pb-4 px-4">Start Date</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {stats?.recent_trips && stats.recent_trips.length > 0 ? (
                stats.recent_trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4 font-semibold text-white">
                      <div>Booking #{trip.id}</div>
                      <div className="text-xs font-normal text-white/50">{trip.trip?.from} to {trip.trip?.to}</div>
                    </td>
                    <td className="py-4 px-4">
                      {trip.user?.name || 'N/A'}
                      <div className="text-xs text-white/50">{trip.user?.email || 'No email'}</div>
                    </td>
                    <td className="py-4 px-4">
                      {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 pl-4 text-right">
                      <Link
                        to={`/driver/trips/${trip.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-white/40 font-medium">
                    No recent trips found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
