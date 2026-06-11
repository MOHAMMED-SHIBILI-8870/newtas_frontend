const AuthShell = ({ eyebrow, title, subtitle, children, footer, image, overlay = 'from-slate-950/90 via-slate-950/55 to-slate-950/70' }) => {
  return (
    <div className="min-h-[calc(100vh-81px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 shadow-2xl lg:block">
          <img
            src={image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'}
            alt="Travel inspiration"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${overlay}`} />
          <div className="relative flex h-full min-h-[680px] flex-col justify-between p-10 text-white">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-cyan-200 backdrop-blur">
              TravelAI
            </div>
            <div className="max-w-xl">
              {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">{eyebrow}</p> : null}
              <h1 className="mt-4 text-5xl font-black leading-tight">{title}</h1>
              <p className="mt-4 max-w-lg text-base leading-8 text-slate-200">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:p-10">
            {children}
            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthShell

