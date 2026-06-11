import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, RotateCcw, CreditCard, CircleDollarSign, BadgeAlert, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminDashboardSummary } from '../../../services/dashboardService'
// import { fetchInvoice, requestRefund } from '../../../services/paymentsService'
import { getApiErrorMessage } from '../../../infrastructure/api/apiHelpers'
import AdminPageHeader from '../../../features/admin/components/AdminPageHeader'
import AdminKpiCard from '../../../features/admin/components/AdminKpiCard'
import AdminChartCard from '../../../features/admin/components/AdminChartCard'
import DataTable from '../../../components/DataTable'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const normalizePayment = (payment) => {
  const tripLabel =
    payment?.trip?.name ||
    payment?.trip?.title ||
    `${payment?.trip?.from || payment?.from || 'Unknown'} -> ${payment?.trip?.to || payment?.to || 'Destination'}`

  const amount = Number(payment?.amount || payment?.total_amount || payment?.price || payment?.trip?.price || 0)
  const status = String(payment?.status || payment?.payment_status || 'pending').toLowerCase()
  const gateway = String(payment?.gateway || payment?.provider || payment?.payment_gateway || 'manual').toLowerCase()

  return {
    ...payment,
    amount,
    gateway,
    status,
    tripLabel,
    customerLabel: payment?.user?.full_name || payment?.user?.email || payment?.customer_name || 'Unknown customer',
  }
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState({ payments: [], bookings: [] })
  const [statusFilter, setStatusFilter] = useState('all')
  const [gatewayFilter, setGatewayFilter] = useState('all')

  const loadPayments = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      }

      const data = await fetchAdminDashboardSummary()
      setSummary({
        payments: Array.isArray(data?.payments) ? data.payments : [],
        bookings: Array.isArray(data?.bookings) ? data.bookings : [],
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load payment records'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadPayments()
  }, [])

  const rows = useMemo(() => {
    const source = summary.payments.length > 0 ? summary.payments : summary.bookings
    return source.map((item) => normalizePayment(item))
  }, [summary.bookings, summary.payments])

  const gatewayOptions = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.gateway).filter(Boolean)))
    return [
      { label: 'All gateways', value: 'all' },
      ...unique.map((gateway) => ({ label: gateway.toUpperCase(), value: gateway })),
    ]
  }, [rows])

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = statusFilter === 'all' || row.status === statusFilter
        const matchesGateway = gatewayFilter === 'all' || row.gateway === gatewayFilter
        return matchesStatus && matchesGateway
      }),
    [gatewayFilter, rows, statusFilter],
  )

  const totalRevenue = rows.reduce((sum, row) => {
    const isSuccessful = ['paid', 'success', 'completed'].includes(row.status)
    return isSuccessful ? sum + Number(row.amount || 0) : sum
  }, 0)

  const paidCount = rows.filter((row) => ['paid', 'success', 'completed'].includes(row.status)).length
  const pendingCount = rows.filter((row) => ['pending', 'processing'].includes(row.status)).length
  const refundedCount = rows.filter((row) => row.status === 'refunded').length

  const handleInvoice = async (payment) => {
    try {
      const data = await fetchInvoice(payment.id)
      const url = data?.download_url || data?.url || data?.invoice_url || data?.pdf_url

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }

      toast.success('Invoice loaded')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load invoice'))
    }
  }

  const handleRefund = async (payment) => {
    const reason = window.prompt('Refund reason', 'Customer requested refund')
    if (!reason) {
      return
    }

    try {
      await requestRefund(payment.id, { reason, refund_reason: reason })
      toast.success('Refund requested successfully')
      await loadPayments({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to request refund'))
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Payments"
        title="Payment operations"
        description="Monitor gateway status, download invoices, and manage refunds from a production-ready payment workspace."
        actions={
          <>
            <button
              type="button"
              onClick={() => void loadPayments({ silent: true })}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Revenue"
          value={currencyFormatter.format(totalRevenue || 0)}
          helper="Successful payments only"
          icon={CircleDollarSign}
          tone="yellow"
        />
        <AdminKpiCard
          label="Paid"
          value={paidCount}
          helper="Completed transactions"
          icon={BadgeCheck}
          tone="emerald"
        />
        <AdminKpiCard
          label="Pending"
          value={pendingCount}
          helper="Awaiting confirmation"
          icon={CreditCard}
          tone="cyan"
        />
        <AdminKpiCard
          label="Refunded"
          value={refundedCount}
          helper="Processed or requested refunds"
          icon={BadgeAlert}
          tone="rose"
        />
      </div>

      <AdminChartCard
        eyebrow="Filters"
        title="Gateway and payment state filters"
        description="Switch between payment states and providers to isolate transactions."
      >
        <div className="flex flex-wrap gap-3">
          <label className="min-w-[180px]">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">
              Payment status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="success">Success</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <label className="min-w-[180px]">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">
              Gateway
            </span>
            <select
              value={gatewayFilter}
              onChange={(event) => setGatewayFilter(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-300"
            >
              {gatewayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AdminChartCard>

      {loading ? (
        <AdminChartCard eyebrow="Loading" title="Payment records">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/45">
            Loading payment data...
          </div>
        </AdminChartCard>
      ) : (
        <DataTable
          title="Payment ledger"
          description="Each row represents a payment or a payment-ready booking record, depending on which backend feed is currently available."
          rows={filteredRows}
          rowKey="id"
          searchPlaceholder="Search by customer, trip, gateway, or status"
          searchKeys={['customerLabel', 'tripLabel', 'gateway', 'status']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All statuses', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
                { label: 'Success', value: 'success' },
                { label: 'Processing', value: 'processing' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' },
              ],
            },
            {
              key: 'gateway',
              label: 'Gateway',
              value: gatewayFilter,
              onChange: setGatewayFilter,
              options: gatewayOptions,
            },
          ]}
          columns={[
            {
              key: 'id',
              label: 'Payment',
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-950">#{row.id}</p>
                  <p className="text-xs text-slate-500">Reference #{row.reference || row.payment_reference || row.order_id || row.id}</p>
                </div>
              ),
            },
            {
              key: 'customer',
              label: 'Customer',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.customerLabel}</p>
                  <p className="text-sm text-slate-500">{row.user?.email || row.email || 'No email available'}</p>
                </div>
              ),
            },
            {
              key: 'tripLabel',
              label: 'Trip',
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.tripLabel}</p>
                  <p className="text-sm text-slate-500">{row.trip?.duration || row.duration || 0} days</p>
                </div>
              ),
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (row) => <span className="font-semibold text-slate-950">{currencyFormatter.format(row.amount || 0)}</span>,
            },
            {
              key: 'gateway',
              label: 'Gateway',
              render: (row) => (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
                  {String(row.gateway || 'manual').toUpperCase()}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${
                    row.status === 'paid' || row.status === 'success' || row.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : row.status === 'refunded'
                        ? 'bg-amber-50 text-amber-700'
                        : row.status === 'failed'
                          ? 'bg-rose-50 text-rose-700'
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
                    onClick={() => void handleInvoice(row)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRefund(row)}
                    disabled={['refunded', 'failed', 'pending'].includes(row.status)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Refund
                  </button>
                </div>
              ),
            },
          ]}
          emptyState={
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-950">No payment records match your filters.</p>
              <p className="mt-2 text-sm text-slate-500">Try clearing the gateway or status filters.</p>
            </div>
          }
          loading={loading}
        />
      )}
    </div>
  )
}
