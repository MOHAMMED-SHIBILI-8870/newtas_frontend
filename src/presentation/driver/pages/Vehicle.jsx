import { useEffect, useState } from 'react'
import { Truck, Users, ShieldAlert, BadgeAlert, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchDriverVehicle } from '../../../services/driverService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'

export default function Vehicle() {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const data = await fetchDriverVehicle()
        setVehicle(data)
      } catch (error) {
        // Suppress 404/not found log errors as they are expected when no vehicle is assigned
        if (error?.response?.status !== 404) {
          toast.error(getApiErrorMessage(error, 'Failed to fetch assigned vehicle'))
        }
      } finally {
        setLoading(false)
      }
    }
    void loadVehicle()
  }, [])

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="My Vehicle"
        title="Assigned Fleet Details"
        description="Inspect and view details of your assigned dispatch vehicle."
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-20 text-yellow-400">
          <Loader2 className="animate-spin" />
          <span>Loading vehicle details...</span>
        </div>
      ) : vehicle ? (
        <div className="max-w-2xl rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/25">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{vehicle.name}</h3>
              <p className="text-sm text-white/50">Type: {vehicle.type}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-1">
              <span className="text-white/40 block text-xs">Total Seats Capacity</span>
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-yellow-400" /> {vehicle.total_seats} seats
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-1">
              <span className="text-white/40 block text-xs">Seats Remaining</span>
              <span className="text-lg font-bold text-white">
                {vehicle.available_seats} available
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-1">
              <span className="text-white/40 block text-xs">Price Per Person</span>
              <span className="text-lg font-bold text-white">
                ${vehicle.price_per_person || '0.00'}
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-1">
              <span className="text-white/40 block text-xs">Vehicle Operational Status</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                vehicle.status === 'active' || vehicle.status === 'assigned'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {vehicle.status}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40">
            <BadgeAlert size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Vehicle Assigned</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto mt-1">
              You do not have a vehicle linked to your driver profile yet. Please contact your administrator or fleet manager to assign a vehicle.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
