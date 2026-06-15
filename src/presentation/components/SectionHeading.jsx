import { useLocation } from 'react-router-dom'

const SectionHeading = ({ eyebrow, title, description, action }) => {
  const { pathname } = useLocation()
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver')

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className={`text-xs font-bold uppercase tracking-[0.35em] ${isDark ? 'text-yellow-300' : 'text-cyan-600'}`}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`mt-2 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
        {description ? (
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export default SectionHeading

