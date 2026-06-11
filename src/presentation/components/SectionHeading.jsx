const SectionHeading = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-black text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
)

export default SectionHeading

