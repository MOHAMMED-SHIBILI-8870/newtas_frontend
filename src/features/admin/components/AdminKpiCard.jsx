import { useLocation } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const toneClasses = {
  yellow: 'from-yellow-400/25 to-yellow-500/5 border-yellow-300/30 text-yellow-100',
  slate: 'from-white/10 to-white/5 border-white/10 text-white',
  cyan: 'from-cyan-400/20 to-cyan-500/5 border-cyan-300/20 text-cyan-100',
  emerald: 'from-emerald-400/20 to-emerald-500/5 border-emerald-300/20 text-emerald-100',
  rose: 'from-rose-400/20 to-rose-500/5 border-rose-300/20 text-rose-100',
  amber: 'from-amber-400/20 to-amber-500/5 border-amber-300/20 text-amber-100',
}

const lightToneClasses = {
  yellow: 'from-yellow-100 to-yellow-50/30 border-yellow-200 text-yellow-900 shadow-sm',
  slate: 'from-slate-100 to-slate-50/30 border-slate-200 text-slate-900 shadow-sm',
  cyan: 'from-cyan-100 to-cyan-50/30 border-cyan-200 text-cyan-900 shadow-sm',
  emerald: 'from-emerald-100 to-emerald-50/30 border-emerald-200 text-emerald-900 shadow-sm',
  rose: 'from-rose-100 to-rose-50/30 border-rose-200 text-rose-900 shadow-sm',
  amber: 'from-amber-100 to-amber-50/30 border-amber-200 text-amber-900 shadow-sm',
}

export default function AdminKpiCard({ label, value, helper, delta, icon: Icon, tone = 'slate' }) {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <div
      className={`rounded-[28px] border bg-gradient-to-br p-5 ${
        isDark
          ? `shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl ${toneClasses[tone] || toneClasses.slate}`
          : `shadow-md ${lightToneClasses[tone] || lightToneClasses.slate}`
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.35em] ${isDark ? 'text-white/55' : 'text-slate-500'}`}>{label}</p>
          <p className={`mt-4 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {helper ? <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{helper}</p> : null}
        </div>

        {Icon ? (
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${
            isDark
              ? 'border-white/10 bg-white/10 text-white/90'
              : 'border-slate-200 bg-white shadow-sm text-slate-700'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {delta ? (
        <div className={`mt-5 inline-flex items-center gap-1 rounded-full border ${
          isDark
            ? 'border-white/10 bg-white/5 text-white/80'
            : 'border-slate-200 bg-white text-slate-700'
        } px-3 py-1 text-xs font-semibold`}>
          <ArrowUpRight className="h-3.5 w-3.5" />
          {delta}
        </div>
      ) : null}
    </div>
  )
}

