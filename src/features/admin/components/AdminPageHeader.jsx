export default function AdminPageHeader({ eyebrow, title, description, actions, meta }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-yellow-300">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-7 text-white/65">{description}</p> : null}
        {meta ? <div className="mt-4">{meta}</div> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

