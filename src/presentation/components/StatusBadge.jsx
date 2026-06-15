import { useLocation } from 'react-router-dom'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  pending_payment: 'bg-amber-50 text-amber-700 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  active: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  unread: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  read: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const darkStatusStyles = {
  pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  pending_payment: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  approved: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  rejected: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  active: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/20',
  confirmed: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  cancelled: 'bg-zinc-800 text-zinc-300 ring-zinc-700',
  unread: 'bg-yellow-400/10 text-yellow-300 ring-yellow-400/20',
  read: 'bg-zinc-800 text-zinc-300 ring-zinc-700',
}

const StatusBadge = ({ status = 'default', children, className = '' }) => {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')
  const key = String(status).toLowerCase()

  const styles = isDark
    ? (darkStatusStyles[key] || 'bg-zinc-800 text-zinc-300 ring-zinc-700')
    : (statusStyles[key] || 'bg-slate-100 text-slate-600 ring-slate-200')

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] ring-1 ${styles} ${className}`}>
      {String(children || status).replace(/_/g, ' ')}
    </span>
  )
}

export default StatusBadge

