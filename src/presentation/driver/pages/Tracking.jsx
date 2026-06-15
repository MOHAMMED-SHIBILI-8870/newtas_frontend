import { useEffect, useState, useRef } from 'react'
import { Route, MapPin, Loader2, Navigation, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateDriverTracking } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Tracking() {
  const [trackingActive, setTrackingActive] = useState(false)
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)
  const intervalId = useRef(null)

  const sendLocation = async (lat, lng) => {
    try {
      await updateDriverTracking({ latitude: lat, longitude: lng })
      setCoords({ lat, lng, time: new Date() })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update live coordinates on server'))
      // If error occurs (e.g. no active trip to track), turn off tracking
      setTrackingActive(false)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setTrackingActive(true)

    const triggerUpdate = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          void sendLocation(latitude, longitude)
          setLoading(false)
        },
        (error) => {
          toast.error(`Error getting GPS coordinates: ${error.message}`)
          setTrackingActive(false)
          setLoading(false)
        },
        { enableHighAccuracy: true }
      )
    }

    // Run first coordinate update immediately
    triggerUpdate()

    // Setup interval to post coordinates every 10 seconds
    intervalId.current = setInterval(triggerUpdate, 10000)
  }

  const stopTracking = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
      intervalId.current = null
    }
    setTrackingActive(false)
    setCoords(null)
    toast.success('Live location tracking stopped.')
  }

  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [])

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Live Tracking"
        title="GPS Dispatch Tracking"
        description="Share your real-time vehicle location with the administrator and travelers during an active trip."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Toggle Panel */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Location Sharing Status</h3>
            <p className="text-white/50 text-sm">
              Live tracking transmits your GPS coordinates coordinates to travelers and administrative offices periodically. You must have an active trip marked as 'started' or 'ongoing' to transmit updates.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={trackingActive ? stopTracking : startTracking}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-slate-950 shadow-lg transition duration-200 ${
                trackingActive
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/25'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-500/25'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Navigation className={trackingActive ? 'rotate-45' : ''} size={20} />
              )}
              {trackingActive ? 'Stop Live Location' : 'Start Live Location'}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
            <MapPin size={18} className="text-yellow-400" />
            Live Coordinates Feed
          </h3>

          {coords ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between">
                <div>
                  <span className="text-white/40 block text-xs">Latitude</span>
                  <span className="text-lg font-bold text-white font-mono">{coords.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-xs">Longitude</span>
                  <span className="text-lg font-bold text-white font-mono">{coords.lng.toFixed(6)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/50">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Last updated at: {coords.time.toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-white/40 font-medium">
              Location tracking is currently inactive. Press 'Start Live Location' to initiate location broadcasts.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
