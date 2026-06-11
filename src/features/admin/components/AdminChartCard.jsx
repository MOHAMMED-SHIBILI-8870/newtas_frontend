export default function AdminChartCard({ eyebrow, title, description, children, actions }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-yellow-300/80">{eyebrow}</p> : null}
          <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  )
}

