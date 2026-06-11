import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, Sparkles, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../domain/context/AuthContext'
import { useNotifications } from '../../../domain/context/NotificationContext'
import { fetchMyBookings } from '../../../infrastructure/api/tripService'
import { fetchMyAiTripRequests } from '../../../infrastructure/api/aiApi'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import StatCard from '../../components/StatCard'
import SectionHeading from '../../components/SectionHeading'
import LoadingState from '../../components/LoadingState'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function DashboardPage() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [bookings, setBookings] = useState([])
  const [aiRequests, setAiRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookingData, requestData] = await Promise.all([fetchMyBookings(), fetchMyAiTripRequests()])
        setBookings(Array.isArray(bookingData) ? bookingData : [])
        setAiRequests(Array.isArray(requestData) ? requestData : [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard data'))
        setBookings([])
        setAiRequests([])
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const stats = useMemo(
    () => [
      {
        label: 'Bookings',
        value: bookings.length,
        helper: 'Total trips booked from your account',
        icon: CalendarDays,
        tone: 'cyan',
      },
      {
        label: 'AI Requests',
        value: aiRequests.length,
        helper: 'AI-generated trip submissions',
        icon: Sparkles,
        tone: 'emerald',
      },
      {
        label: 'Unread notifications',
        value: unreadCount,
        helper: 'New updates from the system',
        icon: Bell,
        tone: 'amber',
      },
      {
        label: 'Profile',
        value: user?.role || 'user',
        helper: user?.email || 'No email found',
        icon: ClipboardList,
        tone: 'slate',
      },
    ],
    [aiRequests.length, bookings.length, unreadCount, user?.email, user?.role],
  )

  const recentBookings = bookings.slice(0, 3)
  const recentRequests = aiRequests.slice(0, 3)

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="User dashboard"
        title={`Welcome back, ${user?.full_name || user?.email || 'traveller'}`}
        description="Track your bookings, notifications, and AI trip requests from one place."
        action={
          <Link
            to="/ai-planner"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Generate AI Trip
          </Link>
        }
      />

      {loading ? (
        <LoadingState label="Loading your dashboard..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">Bookings</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Recent bookings</h2>
                </div>
                <Link to="/bookings" className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {recentBookings.length === 0 ? (
                  <EmptyState
                    title="No bookings yet"
                    description="Your confirmed trips will appear here once you make a booking."
                  />
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-950">
                            {booking.trip?.from || 'Unknown'} → {booking.trip?.to || 'Destination'}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Schedule: {booking.start_date && booking.end_date ? `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}` : 'TBD'}
                          </p>
                        </div>
                        <StatusBadge status={booking.status || 'confirmed'}>{booking.status || 'confirmed'}</StatusBadge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">AI</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Recent AI requests</h2>
                </div>
                <Link to="/ai-planner" className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">
                  New request
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {recentRequests.length === 0 ? (
                  <EmptyState
                    title="No AI requests yet"
                    description="Generate a trip plan and send it to admin to see your request here."
                  />
                ) : (
                  recentRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-950">
                            {request.from} → {request.to}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.days} days, {request.trip_type}
                          </p>
                        </div>
                        <StatusBadge status={request.status || 'pending'}>{request.status || 'pending'}</StatusBadge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

