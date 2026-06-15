import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Bell,
  ClipboardList,
  Coins,
  MapPinned,
  MessageCircleWarning,
  Sparkles,
  Star,
  Truck,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminDashboardSummary } from '../../../services/dashboardService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import { SkeletonMetricGrid, SkeletonChart } from '../../../components/Skeletons'

const chartColors = ['#facc15', '#38bdf8', '#f472b6', '#34d399', '#f97316', '#a78bfa']
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' })
const dayFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const toDate = (value) => {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`

const aggregateByMonth = (items, valueSelector) => {
  const map = new Map()

  items.forEach((item) => {
    const date = toDate(item.created_at || item.createdAt || item.updated_at || item.updatedAt)
    if (!date) {
      return
    }

    const key = monthKey(date)
    const current = map.get(key) || {
      key,
      label: monthFormatter.format(date),
      value: 0,
      date,
    }

    current.value += Number(valueSelector(item) || 0)
    map.set(key, current)
  })

  return Array.from(map.values())
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(-6)
}

const aggregateByDay = (items, valueSelector, limit = 14) => {
  const map = new Map()

  items.forEach((item) => {
    const date = toDate(item.created_at || item.createdAt || item.updated_at || item.updatedAt)
    if (!date) {
      return
    }

    const key = date.toDateString()
    const current = map.get(key) || {
      key,
      label: dayFormatter.format(date),
      value: 0,
      date,
    }

    current.value += Number(valueSelector(item) || 0)
    map.set(key, current)
  })

  return Array.from(map.values())
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(-limit)
}

const countBy = (items, selector) => {
  const map = new Map()

  items.forEach((item) => {
    const label = selector(item) || 'Unknown'
    map.set(label, (map.get(label) || 0) + 1)
  })

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

const getTripLabel = (booking) =>
  booking?.trip?.name ||
  booking?.trip?.title ||
  `${booking?.trip?.from || 'Unknown'} -> ${booking?.trip?.to || 'Destination'}`

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({
    users: [],
    trips: [],
    bookings: [],
    notifications: [],
    aiRequests: [],
    payments: [],
    complaints: [],
    reviews: [],
    vehicles: [],
    offers: [],
  })

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchAdminDashboardSummary()
        setSummary({
          users: Array.isArray(data?.users) ? data.users : [],
          trips: Array.isArray(data?.trips) ? data.trips : [],
          bookings: Array.isArray(data?.bookings) ? data.bookings : [],
          notifications: Array.isArray(data?.notifications) ? data.notifications : [],
          aiRequests: Array.isArray(data?.aiRequests) ? data.aiRequests : [],
          payments: Array.isArray(data?.payments) ? data.payments : [],
          complaints: Array.isArray(data?.complaints) ? data.complaints : [],
          reviews: Array.isArray(data?.reviews) ? data.reviews : [],
          vehicles: Array.isArray(data?.vehicles) ? data.vehicles : [],
          offers: Array.isArray(data?.offers) ? data.offers : [],
        })
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Failed to load admin dashboard'))
        toast.error(getApiErrorMessage(requestError, 'Failed to load admin dashboard'))
      } finally {
        setLoading(false)
      }
    }

    void loadSummary()
  }, [])

  const metrics = useMemo(() => {
    const activeTrips = summary.trips.filter((trip) => {
      const status = String(trip?.status || trip?.state || '').toLowerCase()
      return ['active', 'published', 'live', 'approved'].includes(status) || trip?.is_active === true
    }).length

    const paidPayments = summary.payments.filter((payment) => {
      const status = String(payment?.status || '').toLowerCase()
      return ['paid', 'success', 'completed'].includes(status)
    })

    const revenueFromPayments = paidPayments.reduce(
      (total, payment) => total + Number(payment?.amount || payment?.total_amount || payment?.price || 0),
      0,
    )

    const revenueFromBookings = summary.bookings.reduce(
      (total, booking) => total + Number(booking?.amount || booking?.price || booking?.trip?.price || 0),
      0,
    )

    const revenue = revenueFromPayments || revenueFromBookings

    const pendingAiRequests = summary.aiRequests.filter(
      (request) => String(request?.status || '').toLowerCase() === 'pending',
    ).length

    const unreadNotifications = summary.notifications.filter((notification) => !notification.is_read).length

    return [
      {
        label: 'Total Users',
        value: summary.users.length,
        helper: 'Registered accounts in the system',
        icon: Users,
        tone: 'yellow',
      },
      {
        label: 'Total AI requests',
        value: summary.aiRequests.length,
        helper: `${pendingAiRequests} pending approval`,
        icon: Sparkles,
        tone: 'cyan',
      },
      {
        label: 'Total Revenue',
        value: currencyFormatter.format(revenue || 0),
        helper: `${summary.payments.length} payment records`,
        icon: Coins,
        tone: 'amber',
      },
    ]
  }, [summary])

  const revenueData = useMemo(
    () =>
      aggregateByMonth(
        summary.payments.length > 0 ? summary.payments : summary.bookings,
        (item) => item?.amount || item?.total_amount || item?.price || item?.trip?.price || 0,
      ),
    [summary.bookings, summary.payments],
  )

  const bookingsData = useMemo(
    () =>
      aggregateByDay(summary.bookings, () => 1, 14).map((entry) => ({
        ...entry,
        value: entry.value,
      })),
    [summary.bookings],
  )

  const userGrowthData = useMemo(
    () => aggregateByMonth(summary.users, () => 1),
    [summary.users],
  )

  const tripPerformanceData = useMemo(() => {
    const counts = new Map()

    summary.bookings.forEach((booking) => {
      const label = getTripLabel(booking)
      counts.set(label, (counts.get(label) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5)
  }, [summary.bookings])

  const complaintStats = useMemo(() => {
    const stats = countBy(summary.complaints, (complaint) => String(complaint?.status || 'open').toLowerCase())
    return stats.map((item) => ({ ...item, label: item.label || 'open' }))
  }, [summary.complaints])

  const reviewStats = useMemo(() => {
    const ratings = countBy(summary.reviews, (review) => {
      const rating = Number(review?.rating || review?.stars || 0)
      return rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Unrated'
    })

    return ratings
  }, [summary.reviews])

  const topVehicles = useMemo(() => summary.vehicles.slice(0, 4), [summary.vehicles])
  const topOffers = useMemo(() => summary.offers.slice(0, 4), [summary.offers])
  const pendingRequests = useMemo(
    () => summary.aiRequests.filter((request) => String(request?.status || '').toLowerCase() === 'pending').slice(0, 4),
    [summary.aiRequests],
  )

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Operations overview"
        title="Premium admin dashboard"
        description="Track revenue, bookings, user growth, complaints, reviews, and AI approvals from a single operational workspace."
        actions={
          <>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
            >
              <Coins className="h-4 w-4" />
              Payments
            </Link>
            <Link
              to="/admin/tracking"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Truck className="h-4 w-4" />
              Tracking
            </Link>
          </>
        }
      />

      {loading ? (
        <>
          <SkeletonMetricGrid count={8} />
          <div className="grid gap-6 xl:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </>
      ) : error ? (
        <div className="rounded-[32px] border border-rose-400/20 bg-rose-500/10 p-8 text-rose-100 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-200">Dashboard error</p>
          <p className="mt-3 text-sm leading-7">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <AdminKpiCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminChartCard
              eyebrow="Revenue"
              title="Monthly revenue overview"
              description="Payments are grouped by month and fall back to booking totals if the payments feed is not yet populated."
            >
              <div className="h-80">
                {revenueData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No revenue data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                        formatter={(value) => currencyFormatter.format(Number(value || 0))}
                      />
                      <Area type="monotone" dataKey="value" stroke="#facc15" fill="url(#revenueFill)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>

            <AdminChartCard
              eyebrow="Bookings"
              title="Daily bookings"
              description="A rolling view of booking activity across the last few days of available data."
            >
              <div className="h-80">
                {bookingsData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No booking history yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <AdminChartCard
              eyebrow="AI approvals"
              title="Pending request queue"
              description="Review the latest AI trip plans that are waiting for admin approval."
            >
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/45">
                    No pending AI requests.
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {request.from || 'Origin'}{' -> '}{request.to || 'Destination'}
                          </p>
                          <p className="mt-1 text-xs text-white/55">
                            {request.days || 0} days, {request.trip_type || 'Trip type'}
                          </p>
                        </div>
                        <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-yellow-200">
                          {request.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminChartCard>

            <AdminChartCard
              eyebrow="Users"
              title="Monthly user growth"
              description="New registrations aggregated by month."
            >
              <div className="h-80">
                {userGrowthData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No user growth data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <AdminChartCard
              eyebrow="Trips"
              title="Most booked trips"
              description="The current top-performing packages by booking count."
            >
              <div className="h-80">
                {tripPerformanceData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No trip performance data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        width={120}
                        tick={{ fill: '#cbd5e1', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>

            <AdminChartCard
              eyebrow="Complaints"
              title="Complaint status mix"
              description="A quick snapshot of complaint handling progress."
            >
              <div className="h-80">
                {complaintStats.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No complaint data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Pie data={complaintStats} dataKey="value" nameKey="label" innerRadius={68} outerRadius={110}>
                        {complaintStats.map((entry, index) => (
                          <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>

            <AdminChartCard
              eyebrow="Reviews"
              title="Rating summary"
              description="Customer feedback grouped by rating."
            >
              <div className="h-80">
                {reviewStats.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 text-sm text-white/45">
                    No reviews yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reviewStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: '#09090b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#a78bfa" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminChartCard
              eyebrow="Vehicles"
              title="Fleet snapshot"
              description="Vehicles loaded from the backend. Use the dedicated vehicles page for CRUD and assignment actions."
            >
              {topVehicles.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/45">
                  No vehicles available yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {topVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">{vehicle.name || vehicle.registration_number || 'Vehicle'}</p>
                      <p className="mt-1 text-xs text-white/55">
                        {vehicle.type || 'Type'}{' | '}{vehicle.status || 'active'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AdminChartCard>

            <AdminChartCard
              eyebrow="Offers"
              title="Active offers"
              description="Current promotional offers and coupon campaigns."
            >
              {topOffers.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/45">
                  No active offers yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {topOffers.map((offer) => (
                    <div key={offer.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">{offer.title || offer.code || 'Offer'}</p>
                      <p className="mt-1 text-xs text-white/55">
                        {offer.discount || offer.discount_percent || 0}% off
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AdminChartCard>
          </div>
        </>
      )}
    </div>
  )
}
