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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Kerala Tour Command Station</h1>
          <p className="mt-1 text-slate-500">
            {viewMode === 'templates'
              ? 'Configuring master packages and destinations'
              : 'Live monitoring tracker of incoming client bookings'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch rounded-xl border bg-white p-1.5 shadow-sm md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('templates')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition md:flex-none ${
              viewMode === 'templates' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers size={16} /> Templates
          </button>
          <button
            type="button"
            onClick={() => setViewMode('orders')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition md:flex-none ${
              viewMode === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag size={16} /> Booked Slots
          </button>
        </div>
      </div>

      {viewMode === 'templates' && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search package locations..."
              className="w-full rounded-xl border bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 sm:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} /> Add Trip Template
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : viewMode === 'templates' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed bg-white py-12 text-center text-slate-400">
              No matching tour templates discovered.
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                <div>
                  <div className="mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Route Origin</span>
                    <h3 className="text-base font-bold text-slate-800">{trip.from}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Destination</span>
                    <h2 className="text-xl font-black text-blue-600">{trip.to}</h2>
                  </div>
                  <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Calendar size={15} className="text-slate-400" /> {trip.duration} Days</div>
                    <div className="flex items-center gap-2"><Users size={15} className="text-slate-400" /> {trip.members} Slots</div>
                    <div className="flex items-center gap-2"><DollarSign size={15} className="text-slate-400" /> {trip.budget_level}</div>
                    <div className="flex items-center gap-2"><Car size={15} className="text-slate-400" /> {trip.transport}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{trip.trip_type}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEditModal(trip)} className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50">
                      <Edit3 size={18} />
                    </button>
                    <button type="button" onClick={() => handleDelete(trip.id)} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900 text-xs font-semibold uppercase tracking-wider text-white">
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Purchased Itinerary</th>
                  <th className="p-4">Customer Traveler Identity</th>
                  <th className="p-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {safeOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="bg-slate-50 p-8 text-center text-slate-400">
                      No consumer reservations linked inside your database parameters yet.
                    </td>
                  </tr>
                ) : (
                  safeOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-400">#{order.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {order.trip?.from || 'Unknown'} → {order.trip?.to || 'Unknown'}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">{order.trip?.duration || 0} Days Matrix Block</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-blue-600">
                          {order.user?.name || order.user?.full_name || order.user?.email || 'Unknown User'}
                        </div>
                        <div className="text-xs text-slate-500">{order.user?.email || 'Unknown email'}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingTrip ? 'Modify Blueprint Package' : 'Deploy Master Package'}
              </h2>
              <button type="button" onClick={closeModal} className="text-slate-400 transition hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Origin Location</label>
                  <input
                    required
                    placeholder="e.g. Kochi"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Target Destination</label>
                  <input
                    required
                    placeholder="e.g. Munnar Hills"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Min Duration</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.min_duration}
                    onChange={(e) => setFormData({ ...formData, min_duration: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Max Duration</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Max Members</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.members}
                    onChange={(e) => setFormData({ ...formData, members: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Concurrent Slots</label>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.concurrent_slots}
                    onChange={(e) => setFormData({ ...formData, concurrent_slots: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Travel Configuration Category</label>
                  <select
                    className="rounded-xl border bg-white p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.trip_type}
                    onChange={(e) => setFormData({ ...formData, trip_type: e.target.value })}
                  >
                    <option>Family</option>
                    <option>Adventure</option>
                    <option>Solo</option>
                    <option>Couple</option>
                    <option>Friends</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Budget Scale</label>
                  <select
                    className="rounded-xl border bg-white p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.budget_level}
                    onChange={(e) => setFormData({ ...formData, budget_level: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Base Price</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Discount Members Threshold</label>
                  <input
                    type="number"
                    min="0"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.group_discount_threshold}
                    onChange={(e) => setFormData({ ...formData, group_discount_threshold: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Group Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="rounded-xl border p-3 text-sm outline-none transition focus:border-blue-500"
                    value={formData.group_discount_percent}
                    onChange={(e) => setFormData({ ...formData, group_discount_percent: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Pricing by Member Count</h3>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pricing_tiers: [...(formData.pricing_tiers || []), { members: 1, price: 0 }] })}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-200 transition"
                  >
                    + Add Tier
                  </button>
                </div>
                {(formData.pricing_tiers || []).map((tier, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Members</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Members"
                        className="w-full rounded-lg border p-2 text-sm outline-none focus:border-blue-500 bg-white"
                        value={tier.members}
                        onChange={(e) => {
                          const updated = [...formData.pricing_tiers]
                          updated[index].members = Number(e.target.value)
                          setFormData({ ...formData, pricing_tiers: updated })
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Price</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Total Price"
                        className="w-full rounded-lg border p-2 text-sm outline-none focus:border-blue-500 bg-white"
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
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.pricing_tiers || []).length === 0 && (
                  <p className="text-xs text-slate-500 italic mt-2">No pricing tiers defined. Base price will be multiplied by member count.</p>
                )}
              </div>

              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700">
                <Save size={18} /> {editingTrip ? 'Apply Update Constraints' : 'Publish Master Package Template'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
