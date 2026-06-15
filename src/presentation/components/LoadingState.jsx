import { useLocation } from 'react-router-dom'

const LoadingState = ({ label = 'Loading...' }) => {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <div className={`flex min-h-[40vh] items-center justify-center rounded-[28px] border p-8 shadow-sm backdrop-blur ${
      isDark ? 'border-white/10 bg-zinc-950/45' : 'border-slate-200 bg-white/80'
    }`}>
      <div className={`flex items-center gap-3 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
        <span className={`inline-flex h-3 w-3 animate-pulse rounded-full ${isDark ? 'bg-yellow-400' : 'bg-cyan-500'}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}

export default LoadingState

