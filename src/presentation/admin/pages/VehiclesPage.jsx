import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Pencil, Plus, RefreshCw, Trash2, Truck, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createVehicle, deleteVehicle, fetchAdminVehicles, assignVehicle, updateVehicle } from '../../../services/vehiclesService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const initialForm = {
  name: '',
  registration_number: '',
  type: 'Car',
  driver_name: '',
  capacity: 4,
  status: 'active',
}

const normalizeVehicle = (vehicle) => ({
  ...vehicle,
  name: vehicle?.name || vehicle?.model || 'Unnamed vehicle',
  registration_number: vehicle?.registration_number || vehicle?.registration || 'N/A',
  type: vehicle?.type || vehicle?.vehicle_type || 'Car',
  driver_name: vehicle?.driver_name || vehicle?.driver?.full_name || vehicle?.driver?.email || 'Unassigned',
  status: String(vehicle?.status || 'active').toLowerCase(),
  capacity: Number(vehicle?.capacity || vehicle?.seats || 4),
})

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const loadVehicles = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const data = await fetchAdminVehicles()
      setVehicles(Array.isArray(data) ? data.map(normalizeVehicle) : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load vehicles'))
      setVehicles([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadVehicles()
  }, [])

  const openCreate = () => {
    setEditingVehicle(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setForm({
      name: vehicle.name || '',
      registration_number: vehicle.registration_number || '',
      type: vehicle.type || 'Car',
      driver_name: vehicle.driver_name || '',
      capacity: vehicle.capacity || 4,
      status: vehicle.status || 'active',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingVehicle(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, form)
        toast.success('Vehicle updated successfully')
      } else {
        await createVehicle(form)
        toast.success('Vehicle created successfully')
      }

      closeModal()
      await loadVehicles({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save vehicle'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.name}?`)) {
      return
    }

    try {
      await deleteVehicle(vehicle.id)
      toast.success('Vehicle deleted')
      await loadVehicles({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete vehicle'))
    }
  }

  const handleAssign = async (vehicle) => {
    const assignmentType = window.prompt('Assign type? Type driver or booking', 'driver')
    if (!assignmentType) {
      return
    }

    const assigneeId = window.prompt(`Enter ${assignmentType} ID`)
    if (!assigneeId) {
      return
    }

    try {
      await assignVehicle(vehicle.id, {
        assignment_type: assignmentType,
        assignee_type: assignmentType,
        assignee_id: assigneeId,
      })
      toast.success('Vehicle assigned successfully')
      await loadVehicles({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign vehicle'))
    }
  }

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
        const matchesType = typeFilter === 'all' || vehicle.type.toLowerCase() === typeFilter
        return matchesStatus && matchesType
      }),
    [statusFilter, typeFilter, vehicles],
  )

  const activeCount = vehicles.filter((vehicle) => vehicle.status === 'active').length
  const assignedCount = vehicles.filter((vehicle) => vehicle.driver_name !== 'Unassigned').length
  const idleCount = vehicles.length - activeCount

  const typeOptions = useMemo(() => {
    const uniqueTypes = Array.from(new Set(vehicles.map((vehicle) => vehicle.type.toLowerCase())))
    return [
      { label: 'All types', value: 'all' },
      ...uniqueTypes.map((type) => ({ label: type.toUpperCase(), value: type })),
    ]
  }, [vehicles])

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fleet"
        title="Vehicle management"
        description="Create, update, delete, and assign fleet records with a compact CRUD workspace."
        actions={
          <>
            <button
              type="button"
              onClick={() => void loadVehicles({ silent: true })}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
            >
              <Plus className="h-4 w-4" />
              Add vehicle
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Fleet size" value={vehicles.length} helper="Total vehicles" icon={Truck} tone="yellow" />
        <AdminKpiCard label="Active" value={activeCount} helper="Ready for dispatch" icon={CheckCircle2} tone="emerald" />
        <AdminKpiCard label="Assigned" value={assignedCount} helper="Linked to a driver or booking" icon={UserPlus} tone="cyan" />
        <AdminKpiCard label="Idle" value={idleCount} helper="Awaiting assignment or repair" icon={Clock3} tone="amber" />
      </div>

      <AdminChartCard eyebrow="Filters" title="Vehicle filters" description="Use the filters to narrow the fleet list.">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-[180px]">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="min-w-[180px]">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">Type</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AdminChartCard>

      {loading ? (
        <AdminChartCard eyebrow="Loading" title="Vehicle records">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/45">
            Loading vehicle data...
          </div>
        </AdminChartCard>
      ) : (
        <DataTable
          title="Fleet registry"
          description="This table supports search, filters, sorting, and export for the active fleet."
          rows={filteredVehicles}
          rowKey="id"
          loading={loading}
          searchPlaceholder="Search by name, registration number, or driver"
          searchKeys={['name', 'registration_number', 'driver_name', 'type', 'status']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All statuses', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Idle', value: 'idle' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
            {
              key: 'type',
              label: 'Type',
              value: typeFilter,
              onChange: setTypeFilter,
              options: typeOptions,
            },
          ]}
          columns={[
            {
              key: 'name',
              label: 'Vehicle',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.name}</p>
                  <p className="text-sm text-slate-500">{row.registration_number}</p>
                </div>
              ),
            },
            {
              key: 'driver_name',
              label: 'Assigned Driver',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.driver_name}</p>
                  <p className="text-sm text-slate-500">{row.capacity} seats</p>
                </div>
              ),
            },
            {
              key: 'type',
              label: 'Type',
              render: (row) => <span className="font-semibold text-slate-950">{row.type}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${
                    row.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : row.status === 'maintenance'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAssign(row)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row)}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyState={
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-950">No vehicles match your filters.</p>
              <p className="mt-2 text-sm text-slate-500">Add a new vehicle or clear the filters.</p>
            </div>
          }
        />
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-yellow-300/80">Fleet record</p>
                <h2 className="mt-2 text-3xl font-black">{editingVehicle ? 'Edit vehicle' : 'Create vehicle'}</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Vehicle name"
                  value={form.name}
                  onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                />
                <Field
                  label="Registration number"
                  value={form.registration_number}
                  onChange={(value) => setForm((current) => ({ ...current, registration_number: value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  label="Type"
                  value={form.type}
                  onChange={(value) => setForm((current) => ({ ...current, type: value }))}
                  options={['Car', 'Bus', 'Van', 'Truck', 'Bike']}
                />
                <Field
                  label="Driver name"
                  value={form.driver_name}
                  onChange={(value) => setForm((current) => ({ ...current, driver_name: value }))}
                />
                <Field
                  label="Capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(value) => setForm((current) => ({ ...current, capacity: Number(value) }))}
                />
              </div>

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
                options={['active', 'idle', 'maintenance', 'inactive']}
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Save vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text' }) => (
  <label className="space-y-2">
    <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
    />
  </label>
)

const SelectField = ({ label, value, onChange, options }) => (
  <label className="space-y-2">
    <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)
