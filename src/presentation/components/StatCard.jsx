const StatCard = ({ label, value, helper, icon: Icon, tone = 'cyan' }) => {
  const toneMap = {
    cyan: 'bg-cyan-50 text-cyan-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone] || toneMap.cyan}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default StatCard

