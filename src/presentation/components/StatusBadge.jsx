const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  active: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  unread: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  read: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const StatusBadge = ({ status = 'default', children, className = '' }) => {
  const key = String(status).toLowerCase()
  const styles = statusStyles[key] || 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] ring-1 ${styles} ${className}`}>
      {children || status}
    </span>
  )
}

export default StatusBadge

