import { useEffect, useMemo, useState } from 'react'
import { BadgePercent, CheckCircle2, Pencil, Plus, RefreshCw, Trash2, Ticket, WandSparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { createOffer, deleteOffer, fetchAdminOffers, updateOffer, validateCoupon } from '../../../services/offersService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const initialForm = {
  title: '',
  code: '',
  description: '',
  discount_percent: 10,
  starts_at: '',
  ends_at: '',
  active: true,
}

const normalizeOffer = (offer) => ({
  ...offer,
  title: offer?.title || offer?.name || 'Untitled offer',
  code: offer?.code || offer?.coupon_code || 'N/A',
  description: offer?.description || offer?.summary || '',
  discount_percent: Number(offer?.discount_percent || offer?.discount || offer?.value || 0),
  starts_at: offer?.starts_at || offer?.start_date || '',
  ends_at: offer?.ends_at || offer?.end_date || '',
  active: offer?.active ?? offer?.is_active ?? true,
  status: (offer?.active ?? offer?.is_active ?? true) ? 'active' : 'inactive',
})

export default function OffersPage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [referenceNow] = useState(() => Date.now())
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponAmount, setCouponAmount] = useState('')

  const loadOffers = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const data = await fetchAdminOffers()
      setOffers(Array.isArray(data) ? data.map(normalizeOffer) : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load offers'))
      setOffers([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadOffers()
  }, [])

  const openCreate = () => {
    setEditingOffer(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (offer) => {
    setEditingOffer(offer)
    setForm({
      title: offer.title || '',
      code: offer.code || '',
      description: offer.description || '',
      discount_percent: offer.discount_percent || 10,
      starts_at: offer.starts_at || '',
      ends_at: offer.ends_at || '',
      active: offer.active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingOffer(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      if (editingOffer) {
        await updateOffer(editingOffer.id, form)
        toast.success('Offer updated successfully')
      } else {
        await createOffer(form)
        toast.success('Offer created successfully')
      }

      closeModal()
      await loadOffers({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save offer'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (offer) => {
    if (!window.confirm(`Delete offer ${offer.title}?`)) {
      return
    }

    try {
      await deleteOffer(offer.id)
      toast.success('Offer deleted')
      await loadOffers({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete offer'))
    }
  }

  const handleValidateCoupon = async () => {
    if (!couponCode) {
      toast.error('Enter a coupon code first')
      return
    }

    try {
      const payload = {
        code: couponCode,
        coupon_code: couponCode,
        amount: couponAmount ? Number(couponAmount) : undefined,
      }
      const result = await validateCoupon(payload)
      toast.success(result?.message || 'Coupon validated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to validate coupon'))
    }
  }

  const filteredOffers = useMemo(
    () => offers.filter((offer) => statusFilter === 'all' || offer.status === statusFilter),
    [offers, statusFilter],
  )

  const activeOffers = offers.filter((offer) => offer.active).length
  const averageDiscount =
    offers.length > 0 ? Math.round(offers.reduce((sum, offer) => sum + Number(offer.discount_percent || 0), 0) / offers.length) : 0
  const expiringSoon = offers.filter((offer) => {
    const endDate = offer.ends_at ? new Date(offer.ends_at) : null
    if (!endDate || Number.isNaN(endDate.getTime())) {
      return false
    }
    const diff = endDate.getTime() - referenceNow
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 14
  }).length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Offers"
        title="Offer management"
        description="Create and manage offers, coupon codes, and discount campaigns."
        actions={
          <>
            <button
              type="button"
              onClick={() => void loadOffers({ silent: true })}
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
              Add offer
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminKpiCard label="Active offers" value={activeOffers} helper="Enabled campaigns" icon={CheckCircle2} tone="emerald" />
        <AdminKpiCard label="Average discount" value={`${averageDiscount}%`} helper="Across all offers" icon={BadgePercent} tone="yellow" />
        <AdminKpiCard label="Expiring soon" value={expiringSoon} helper="Within 14 days" icon={Ticket} tone="amber" />
      </div>

      <AdminChartCard
        eyebrow="Coupon validation"
        title="Validate a coupon"
        description="Check a coupon code against the backend before sharing it with customers."
      >
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_auto]">
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="Coupon code"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
          />
          <input
            value={couponAmount}
            onChange={(event) => setCouponAmount(event.target.value)}
            placeholder="Amount (optional)"
            type="number"
            min="0"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
          />
          <button
            type="button"
            onClick={() => void handleValidateCoupon()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
          >
            <WandSparkles className="h-4 w-4" />
            Validate
          </button>
        </div>
      </AdminChartCard>

      {loading ? (
        <AdminChartCard eyebrow="Loading" title="Offer records">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/45">
            Loading offer data...
          </div>
        </AdminChartCard>
      ) : (
        <DataTable
          title="Campaign registry"
          description="Search, filter, export, and manage promotional offers from one table."
          rows={filteredOffers}
          rowKey="id"
          searchPlaceholder="Search by title, code, or description"
          searchKeys={['title', 'code', 'description']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All offers', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
          ]}
          columns={[
            {
              key: 'title',
              label: 'Offer',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.title}</p>
                  <p className="text-sm text-slate-500">{row.code}</p>
                </div>
              ),
            },
            {
              key: 'discount_percent',
              label: 'Discount',
              render: (row) => <span className="font-semibold text-slate-950">{row.discount_percent}%</span>,
            },
            {
              key: 'starts_at',
              label: 'Starts',
              render: (row) => <span className="font-semibold text-slate-950">{row.starts_at || 'N/A'}</span>,
            },
            {
              key: 'ends_at',
              label: 'Ends',
              render: (row) => <span className="font-semibold text-slate-950">{row.ends_at || 'N/A'}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${
                    row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
              <p className="text-sm font-semibold text-slate-950">No offers match your filters.</p>
              <p className="mt-2 text-sm text-slate-500">Create a new offer or clear the filter.</p>
            </div>
          }
        />
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-yellow-300/80">Offer record</p>
                <h2 className="mt-2 text-3xl font-black">{editingOffer ? 'Edit offer' : 'Create offer'}</h2>
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
                <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
                <Field label="Coupon code" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value }))} />
              </div>

              <Field
                label="Description"
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Discount percent"
                  type="number"
                  value={form.discount_percent}
                  onChange={(value) => setForm((current) => ({ ...current, discount_percent: Number(value) }))}
                />
                <Field
                  label="Starts at"
                  type="date"
                  value={form.starts_at}
                  onChange={(value) => setForm((current) => ({ ...current, starts_at: value }))}
                />
                <Field
                  label="Ends at"
                  type="date"
                  value={form.ends_at}
                  onChange={(value) => setForm((current) => ({ ...current, ends_at: value }))}
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Active
              </label>

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
                  {submitting ? 'Saving...' : 'Save offer'}
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
