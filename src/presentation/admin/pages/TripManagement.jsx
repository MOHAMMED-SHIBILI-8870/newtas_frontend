import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit3,
  X,
  Save,
  Calendar,
  Users,
  DollarSign,
  Car,
  ShoppingBag,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  fetchAllTrips,
  createNewTrip,
  updateTrip,
  deleteTrip,
  fetchAllBookedOrders,
} from '../../../infrastructure/api/tripService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'

const initialForm = {
  from: '',
  to: '',
  duration: 1,
  min_duration: 1,
  concurrent_slots: 1,
  group_discount_threshold: 0,
  group_discount_percent: 0,
  trip_type: 'Family',
  budget_level: 'Medium',
  price: 0,
  members: 1,
  children: 0,
  hotel_type: '3 Star',
  transport: 'Car',
  pricing_tiers: [],
}

export default function TripManagement() {
  const [viewMode, setViewMode] = useState('templates')
  const [trips, setTrips] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [formData, setFormData] = useState(initialForm)

  const loadDashboardData = async () => {
    setLoading(true)

    try {
      if (viewMode === 'templates') {
        const tripsData = await fetchAllTrips()
        setTrips(Array.isArray(tripsData) ? tripsData : [])
      } else {
        const ordersData = await fetchAllBookedOrders()
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard data'))
      setTrips([])
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  const openCreateModal = () => {
    setEditingTrip(null)
    setFormData(initialForm)
    setShowModal(true)
  }

  const openEditModal = (trip) => {
    setEditingTrip(trip)
    setFormData({
      from: trip.from || '',
      to: trip.to || '',
      duration: trip.duration || 1,
      min_duration: trip.min_duration || 1,
      concurrent_slots: trip.concurrent_slots || 1,
      group_discount_threshold: trip.group_discount_threshold || 0,
      group_discount_percent: trip.group_discount_percent || 0,
      trip_type: trip.trip_type || 'Family',
      budget_level: trip.budget_level || 'Medium',
      price: trip.price || 0,
      members: trip.members || 1,
      children: trip.children || 0,
      hotel_type: trip.hotel_type || '3 Star',
      transport: trip.transport || 'Car',
      pricing_tiers: trip.pricing_tiers || [],
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTrip(null)
    setFormData(initialForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, formData)
        toast.success('Trip updated successfully')
      } else {
        await createNewTrip(formData)
        toast.success('Trip created successfully')
      }

      closeModal()
      await loadDashboardData()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Something went wrong saving the package'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip template?')) return

    try {
      await deleteTrip(id)
      setTrips((prev) => prev.filter((trip) => trip.id !== id))
      toast.success('Trip template deleted successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Delete transaction failed'))
    }
  }

  const filteredTrips = trips.filter(
    (trip) =>
      trip?.from?.toLowerCase().includes(search.toLowerCase()) ||
      trip?.to?.toLowerCase().includes(search.toLowerCase()),
  )

  const safeOrders = Array.isArray(orders) ? orders : []

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-black text-white">Kerala Tour Command Station</h1>
          <p className="mt-1 text-white/60 text-sm">
            {viewMode === 'templates'
              ? 'Configuring master packages and destinations'
              : 'Live monitoring tracker of incoming client bookings'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch rounded-xl border border-white/10 bg-zinc-950/60 p-1.5 shadow-sm md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('templates')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition md:flex-none ${
              viewMode === 'templates' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <Layers size={16} /> Templates
          </button>
          <button
            type="button"
            onClick={() => setViewMode('orders')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition md:flex-none ${
              viewMode === 'orders' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <ShoppingBag size={16} /> Booked Slots
          </button>
        </div>
      </div>

      {viewMode === 'templates' && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search package locations..."
              className="w-full rounded-xl border border-white/10 bg-black py-2 pl-10 pr-4 text-sm text-white outline-none transition focus:border-yellow-400/80 sm:w-72 placeholder-white/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-yellow-300"
          >
            <Plus size={18} /> Add Trip Template
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-yellow-400" size={40} />
        </div>
      ) : viewMode === 'templates' ? (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/60 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10">
                  <th className="p-4">Blueprint ID</th>
                  <th className="p-4">Origin / Route</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Budget Scale</th>
                  <th className="p-4">Trip Category</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90 bg-transparent">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-white/45 bg-zinc-900/10">
                      No matching tour templates discovered.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} className="transition hover:bg-white/5">
                      <td className="p-4 font-mono font-bold text-white/45">#{trip.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{trip.from}</div>
                        <div className="mt-0.5 text-xs text-yellow-300 font-bold">→ {trip.to}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white/80">{trip.duration} Days | {trip.members} Slots</div>
                        <div className="mt-0.5 text-xs text-white/45">{trip.transport}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                          {trip.budget_level}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-lg border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
                          {trip.trip_type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-yellow-300">${trip.price}</td>
                      <td className="p-4">
                        <div className="flex gap-1 justify-center">
                          <button type="button" onClick={() => openEditModal(trip)} className="rounded-lg p-2 text-yellow-350 transition hover:bg-yellow-400/10">
                            <Edit3 size={18} />
                          </button>
                          <button type="button" onClick={() => handleDelete(trip.id)} className="rounded-lg p-2 text-rose-450 transition hover:bg-rose-500/10">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/60 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10">
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Purchased Itinerary</th>
                  <th className="p-4">Customer Traveler Identity</th>
                  <th className="p-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90 bg-transparent">
                {safeOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-white/45 bg-zinc-900/10">
                      No consumer reservations linked inside your database parameters yet.
                    </td>
                  </tr>
                ) : (
                  safeOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-white/5">
                      <td className="p-4 font-mono font-bold text-white/45">#{order.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">
                          {order.trip?.from || 'Unknown'} → {order.trip?.to || 'Unknown'}
                        </div>
                        <div className="mt-0.5 text-xs text-white/45">{order.trip?.duration || 0} Days Matrix Block</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-yellow-300">
                          {order.user?.name || order.user?.full_name || order.user?.email || 'Unknown User'}
                        </div>
                        <div className="text-xs text-white/55">{order.user?.email || 'Unknown email'}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                          {order.status || 'confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/10 p-6 shadow-2xl text-white">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">
                {editingTrip ? 'Modify Blueprint Package' : 'Deploy Master Package'}
              </h2>
              <button type="button" onClick={closeModal} className="text-white/45 transition hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Origin Location</label>
                  <input
                    required
                    placeholder="e.g. Kochi"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Target Destination</label>
                  <input
                    required
                    placeholder="e.g. Munnar Hills"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Min Duration</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.min_duration}
                    onChange={(e) => setFormData({ ...formData, min_duration: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Max Duration</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Max Members</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.members}
                    onChange={(e) => setFormData({ ...formData, members: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Concurrent Slots</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.concurrent_slots}
                    onChange={(e) => setFormData({ ...formData, concurrent_slots: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Travel Configuration Category</label>
                  <select
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.trip_type}
                    onChange={(e) => setFormData({ ...formData, trip_type: e.target.value })}
                  >
                    <option className="bg-zinc-950">Family</option>
                    <option className="bg-zinc-950">Adventure</option>
                    <option className="bg-zinc-950">Solo</option>
                    <option className="bg-zinc-950">Couple</option>
                    <option className="bg-zinc-950">Friends</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Budget Scale</label>
                  <select
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.budget_level}
                    onChange={(e) => setFormData({ ...formData, budget_level: e.target.value })}
                  >
                    <option className="bg-zinc-950">Low</option>
                    <option className="bg-zinc-950">Medium</option>
                    <option className="bg-zinc-950">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Base Price</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Discount Members Threshold</label>
                  <input
                    type="number"
                    min="0"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.group_discount_threshold}
                    onChange={(e) => setFormData({ ...formData, group_discount_threshold: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/60">Group Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition focus:border-yellow-400/80"
                    value={formData.group_discount_percent}
                    onChange={(e) => setFormData({ ...formData, group_discount_percent: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-4 bg-zinc-900/40">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white">Pricing by Member Count</h3>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pricing_tiers: [...(formData.pricing_tiers || []), { members: 1, price: 0 }] })}
                    className="text-xs bg-yellow-400/10 text-yellow-300 px-3 py-1 rounded-full font-semibold hover:bg-yellow-400/20 transition"
                  >
                    + Add Tier
                  </button>
                </div>
                {(formData.pricing_tiers || []).map((tier, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-1">Members</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Members"
                        className="w-full rounded-lg border border-white/10 bg-black p-2 text-sm text-white outline-none focus:border-yellow-400/80"
                        value={tier.members}
                        onChange={(e) => {
                          const updated = [...formData.pricing_tiers]
                          updated[index].members = Number(e.target.value)
                          setFormData({ ...formData, pricing_tiers: updated })
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-1">Total Price</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Total Price"
                        className="w-full rounded-lg border border-white/10 bg-black p-2 text-sm text-white outline-none focus:border-yellow-400/80"
                        value={tier.price}
                        onChange={(e) => {
                          const updated = [...formData.pricing_tiers]
                          updated[index].price = Number(e.target.value)
                          setFormData({ ...formData, pricing_tiers: updated })
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-end h-full pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.pricing_tiers.filter((_, i) => i !== index)
                          setFormData({ ...formData, pricing_tiers: updated })
                        }}
                        className="p-2 text-rose-450 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.pricing_tiers || []).length === 0 && (
                  <p className="text-xs text-white/40 italic mt-2">No pricing tiers defined. Base price will be multiplied by member count.</p>
                )}
              </div>

              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 font-bold text-slate-950 shadow-sm transition hover:bg-yellow-300">
                <Save size={18} /> {editingTrip ? 'Apply Update Constraints' : 'Publish Master Package Template'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
