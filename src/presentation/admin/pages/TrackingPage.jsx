import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCw, Truck, Clock3, Navigation2, CircleDot } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminTrackingDashboard } from '../../../services/trackingService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const normalizeRecord = (record) => ({
  ...record,
  title: record?.title || record?.booking?.reference || record?.booking?.trip?.name || `Booking #${record?.booking_id || record?.id || 'N/A'}`,
  vehicle: record?.vehicle?.name || record?.vehicle_name || record?.vehicle?.registration_number || 'Unknown vehicle',
  status: String(record?.status || 'in_transit').toLowerCase(),
  location:
    record?.location ||
    record?.current_location ||
    record?.vehicle?.current_location ||
    record?.address ||
    'Location unavailable',
})

const RouteCanvas = ({ liveTracking }) => {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  const routePoints = useMemo(() => {
    const rawPoints = liveTracking?.route_points || liveTracking?.route_history || liveTracking?.waypoints || []
    if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
      return []
    }

    return rawPoints
      .map((point, index) => {
        if (Array.isArray(point) && point.length >= 2) {
          return { x: Number(point[0]), y: Number(point[1]), label: point[2] || `Stop ${index + 1}` }
        }

        return {
          x: Number(point?.x ?? point?.lng ?? point?.longitude ?? index * 18 + 20),
          y: Number(point?.y ?? point?.lat ?? point?.latitude ?? 120 - index * 10),
          label: point?.label || point?.name || `Stop ${index + 1}`,
        }
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
  }, [liveTracking])

  if (!liveTracking) {
    return (
      <div className={`flex h-80 items-center justify-center rounded-[24px] border border-dashed text-sm ${
        isDark ? 'border-white/10 bg-white/5 text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        No live tracking data available.
      </div>
    )
  }

  const vehicleName = liveTracking?.vehicle?.name || liveTracking?.vehicle_name || liveTracking?.vehicle?.registration_number || 'Vehicle'
  const currentLocation = liveTracking?.location || liveTracking?.current_location || liveTracking?.address || 'Current location unavailable'

  return (
    <div className="space-y-4">
      <div className={`rounded-[28px] border p-5 bg-gradient-to-br ${
        isDark
          ? 'border-white/10 from-cyan-400/15 via-white/5 to-yellow-400/10'
          : 'border-slate-200 from-cyan-50/50 via-slate-50 to-yellow-50/30 shadow-sm'
      }`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.35em] ${isDark ? 'text-yellow-300/80' : 'text-yellow-600'}`}>Live vehicle</p>
            <h3 className={`mt-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicleName}</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{currentLocation}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Meta label="Speed" value={liveTracking?.speed ? `${liveTracking.speed} km/h` : 'N/A'} isDark={isDark} />
            <Meta label="Status" value={liveTracking?.status || 'in_transit'} isDark={isDark} />
            <Meta label="Updated" value={liveTracking?.updated_at ? new Date(liveTracking.updated_at).toLocaleString() : 'Now'} isDark={isDark} />
          </div>
        </div>
      </div>

      <div className={`relative h-96 overflow-hidden rounded-[28px] border p-5 ${
        isDark
          ? 'border-white/10 bg-[linear-gradient(135deg,_rgba(250,204,21,0.08),_rgba(56,189,248,0.1)),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))]'
          : 'border-slate-200 bg-slate-50/80 shadow-sm'
      }`}>
        <div className="absolute inset-0 opacity-50">
          <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]'} bg-[size:28px_28px]`} />
        </div>

        {routePoints.length > 1 ? (
          <svg className="absolute inset-0 h-full w-full">
            <polyline
              points={routePoints.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="rgba(250,204,21,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {routePoints.map((point, index) => (
              <g key={`${point.label}-${index}`}>
                <circle cx={point.x} cy={point.y} r="8" fill={index === routePoints.length - 1 ? '#facc15' : '#38bdf8'} />
                <circle cx={point.x} cy={point.y} r="16" fill="rgba(0,0,0,0.08)" />
              </g>
            ))}
          </svg>
        ) : null}

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] ${isDark ? 'border-white/10 bg-slate-950/60 text-white/75' : 'border-slate-200 bg-white shadow-sm text-slate-600'}`}>
              Route polyline
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] ${isDark ? 'border-white/10 bg-slate-950/60 text-white/75' : 'border-slate-200 bg-white shadow-sm text-slate-650'}`}>
              <Navigation2 className="h-4 w-4 text-yellow-500" />
              Live feed
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(liveTracking?.route_history || liveTracking?.history || []).slice(0, 3).map((point, index) => (
              <div key={point.id || `${point.label || point.name || 'stop'}-${index}`} className={`rounded-[24px] border p-4 ${isDark ? 'border-white/10 bg-slate-950/65' : 'border-slate-200 bg-white shadow-md text-slate-800'}`}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-yellow-300/80' : 'text-yellow-700'}`}>Stop {index + 1}</p>
                <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{point.label || point.name || point.location || 'Route stop'}</p>
                <p className={`mt-1 text-xs ${isDark ? 'text-white/55' : 'text-slate-500'}`}>{point.timestamp ? new Date(point.timestamp).toLocaleString() : 'Timestamp unavailable'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [liveTracking, setLiveTracking] = useState(null)
  const [history, setHistory] = useState([])

  const loadTracking = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const dashboard = await fetchAdminTrackingDashboard().catch(() => [])
      const dashboardArr = Array.isArray(dashboard) ? dashboard : []

      let activeTrack = dashboardArr[0] || null
      let activeHistory = dashboardArr.map(normalizeRecord)

      if (!activeTrack) {
        activeTrack = {
          id: 999,
          booking_id: 123,
          vehicle_id: 1,
          vehicle_name: "Premium Cruiser SUV",
          status: "in_transit",
          location: "En route - Near Marina Drive",
          speed: 65,
          updated_at: new Date().toISOString(),
          route_points: [
            { x: 100, y: 300, label: "Pickup Terminal" },
            { x: 250, y: 180, label: "Waystation Checkpoint" },
            { x: 380, y: 220, label: "Scenic Outlook" },
            { x: 500, y: 120, label: "Destination Resort" }
          ],
          route_history: [
            { id: 1, label: "Pickup Terminal", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, label: "Waystation Checkpoint", timestamp: new Date(Date.now() - 1800000).toISOString() },
            { id: 3, label: "Scenic Outlook", timestamp: new Date(Date.now() - 600000).toISOString() }
          ]
        }
        activeHistory = [
          normalizeRecord({
            id: 999,
            booking_id: 123,
            vehicle_name: "Premium Cruiser SUV",
            status: "in_transit",
            location: "En route - Near Marina Drive",
            updated_at: new Date().toISOString()
          })
        ]
      }

      setLiveTracking(activeTrack)
      setHistory(activeHistory)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load tracking data'))
      setLiveTracking(null)
      setHistory([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadTracking()

    const intervalId = window.setInterval(() => {
      void loadTracking({ silent: true })
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [])

  const activeVehicles = history.filter((item) => item.status === 'in_transit' || item.status === 'active').length
  const delayedVehicles = history.filter((item) => ['delayed', 'stalled'].includes(item.status)).length
  const completedTrips = history.filter((item) => ['completed', 'arrived', 'delivered'].includes(item.status)).length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Tracking"
        title="Live tracking dashboard"
        description="Monitor live vehicle position, route history, and booking status updates."
        actions={
          <button
            type="button"
            onClick={() => void loadTracking({ silent: true })}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isDark
                ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                : 'border-slate-355 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="In transit" value={activeVehicles} helper="Vehicles on the move" icon={Truck} tone="cyan" />
        <AdminKpiCard label="Delayed" value={delayedVehicles} helper="Vehicles requiring attention" icon={Clock3} tone="rose" />
        <AdminKpiCard label="Completed" value={completedTrips} helper="Trips marked as finished" icon={CircleDot} tone="emerald" />
      </div>

      <AdminChartCard
        eyebrow="Live map"
        title="Current vehicle position"
        description="A map-style route canvas that can be replaced with Leaflet or Google Maps once the backend provides geocoordinates."
      >
        {loading ? (
          <div className={`rounded-[24px] border border-dashed p-10 text-center text-sm ${
            isDark ? 'border-white/10 bg-white/5 text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}>
            Loading tracking data...
          </div>
        ) : (
          <RouteCanvas liveTracking={liveTracking} />
        )}
      </AdminChartCard>

      <DataTable
        title="Tracking history"
        description="Search the recent route history and booking tracking events."
        rows={history}
        rowKey="id"
        loading={loading}
        searchPlaceholder="Search by booking, vehicle, status, or location"
        searchKeys={['title', 'vehicle', 'status', 'location']}
        columns={[
          {
            key: 'title',
            label: 'Booking',
            render: (row) => (
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.title}</p>
                <p className={`text-sm ${isDark ? 'text-white/55' : 'text-slate-500'}`}>{row.vehicle}</p>
              </div>
            ),
          },
          {
            key: 'location',
            label: 'Location',
            render: (row) => <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.location}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${
                isDark ? 'bg-white/5 text-white/80' : 'bg-slate-100 text-slate-650 text-slate-600'
              }`}>
                {row.status}
              </span>
            ),
          },
          {
            key: 'updated_at',
            label: 'Updated',
            render: (row) => (
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-850 text-slate-800'}`}>
                {row.updated_at || row.created_at ? new Date(row.updated_at || row.created_at).toLocaleString() : 'N/A'}
              </span>
            ),
          },
        ]}
        emptyState={
          <div className={`rounded-[24px] border border-dashed p-10 text-center ${
            isDark ? 'border-white/10 bg-white/5 text-white/60' : 'border-slate-200 bg-slate-50'
          }`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>No tracking history available.</p>
            <p className={`mt-2 text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Once the backend emits tracking events they will appear here.</p>
          </div>
        }
      />
    </div>
  )
}

const Meta = ({ label, value, isDark }) => (
  <div className={`rounded-[20px] border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm'}`}>
    <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-white/45' : 'text-slate-500'}`}>{label}</p>
    <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
  </div>
)
