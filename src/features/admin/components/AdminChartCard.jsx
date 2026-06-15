import { useLocation } from 'react-router-dom'

export default function AdminChartCard({ eyebrow, title, description, children, actions }) {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <section className={`rounded-[32px] border p-6 ${
      isDark
        ? 'border-white/10 bg-white/5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl'
        : 'border-slate-200 bg-white shadow-sm'
    }`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow ? (
            <p className={`text-[11px] font-bold uppercase tracking-[0.35em] ${isDark ? 'text-yellow-300/80' : 'text-yellow-650'}`}>
              {eyebrow}
            </p>
          ) : null}
          <h3 className={`mt-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          {description ? (
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  )
}

