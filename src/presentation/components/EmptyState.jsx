const EmptyState = ({ title, description, action }) => (
  <div className="flex min-h-[32vh] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center">
    <p className="text-lg font-bold text-slate-900">{title}</p>
    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
)

export default EmptyState

