const pulseClass = 'animate-pulse rounded-2xl bg-white/10'

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`${pulseClass} ${className}`.trim()} aria-hidden="true" />
)

export const SkeletonCard = () => (
  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
    <div className="space-y-4">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-10 w-32" />
      <SkeletonBlock className="h-4 w-40" />
    </div>
  </div>
)

export const SkeletonMetricGrid = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)

export const SkeletonTable = ({ rows = 6, columns = 4 }) => (
  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-lg shadow-black/10">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-4">
                <SkeletonBlock className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/5">
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <td key={columnIndex} className="px-6 py-4">
                  <SkeletonBlock className="h-4 w-full max-w-[220px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const SkeletonChart = () => (
  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10">
    <div className="space-y-4">
      <SkeletonBlock className="h-4 w-36" />
      <div className="grid h-64 grid-cols-12 items-end gap-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonBlock key={index} className={`rounded-t-2xl ${12 + (index % 4) * 6} h-${12 + (index % 4) * 6}`} />
        ))}
      </div>
    </div>
  </div>
)

