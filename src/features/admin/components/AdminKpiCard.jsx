import { ArrowUpRight } from 'lucide-react'

const toneClasses = {
  yellow: 'from-yellow-400/25 to-yellow-500/5 border-yellow-300/30 text-yellow-100',
  slate: 'from-white/10 to-white/5 border-white/10 text-white',
  cyan: 'from-cyan-400/20 to-cyan-500/5 border-cyan-300/20 text-cyan-100',
  emerald: 'from-emerald-400/20 to-emerald-500/5 border-emerald-300/20 text-emerald-100',
  rose: 'from-rose-400/20 to-rose-500/5 border-rose-300/20 text-rose-100',
  amber: 'from-amber-400/20 to-amber-500/5 border-amber-300/20 text-amber-100',
}

export default function AdminKpiCard({ label, value, helper, delta, icon: Icon, tone = 'slate' }) {
  return (
    <div
      className={`rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl ${
        toneClasses[tone] || toneClasses.slate
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/55">{label}</p>
          <p className="mt-4 text-3xl font-black text-white">{value}</p>
          {helper ? <p className="mt-2 text-sm leading-6 text-white/70">{helper}</p> : null}
        </div>

        {Icon ? (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/90">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {delta ? (
        <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {delta}
        </div>
      ) : null}
    </div>
  )
}

