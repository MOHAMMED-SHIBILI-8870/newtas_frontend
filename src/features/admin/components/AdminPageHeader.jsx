import { useLocation } from 'react-router-dom'

export default function AdminPageHeader({ eyebrow, title, description, actions, meta }) {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className={`text-[11px] font-bold uppercase tracking-[0.45em] ${isDark ? 'text-yellow-300' : 'text-yellow-650'}`}>{eyebrow}</p>
        ) : null}
        <h1 className={`mt-3 text-4xl font-black tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h1>
        {description ? <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{description}</p> : null}
        {meta ? <div className="mt-4">{meta}</div> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

