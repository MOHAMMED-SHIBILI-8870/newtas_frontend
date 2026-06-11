const LoadingState = ({ label = 'Loading...' }) => (
  <div className="flex min-h-[40vh] items-center justify-center rounded-[28px] border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
    <div className="flex items-center gap-3 text-slate-500">
      <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-cyan-500" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  </div>
)

export default LoadingState

