export function StatCardSkeleton() {
  return (
    <div className="mb-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="ark-panel-soft animate-pulse p-4">
          <div className="mb-4 h-3 w-20 bg-white/10" />
          <div className="h-7 w-24 bg-white/10" />
        </div>
      ))}
    </div>
  )
}

export function ProblemListSkeleton() {
  return (
    <div className="ark-panel-soft animate-pulse space-y-3 p-4">
      <div className="h-9 w-full bg-white/10" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-white/10 bg-white/[0.045] p-3.5">
          <div className="mb-2 h-4 w-3/4 bg-white/10" />
          <div className="h-3 w-full bg-white/[0.075]" />
        </div>
      ))}
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="ark-panel-soft animate-pulse space-y-2 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="h-7 w-7 bg-white/10" />
          <div className="flex-1">
            <div className="mb-1 h-3 w-20 bg-white/10" />
            <div className="h-2 w-12 bg-white/[0.075]" />
          </div>
          <div className="h-4 w-8 bg-white/10" />
        </div>
      ))}
    </div>
  )
}
