import { useLocation } from 'react-router-dom'

const EmptyState = ({ title, description, action }) => {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <div className={`flex min-h-[32vh] flex-col items-center justify-center rounded-[28px] border border-dashed p-8 text-center ${
      isDark ? 'border-white/10 bg-zinc-900/30' : 'border-slate-200 bg-white shadow-sm'
    }`}>
      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      <p className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState

