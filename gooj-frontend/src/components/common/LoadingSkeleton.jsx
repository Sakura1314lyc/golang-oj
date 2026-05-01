export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/5 dark:bg-white/5">
          <div className="mb-2 h-3 w-16 rounded-full bg-purple-200/60 dark:bg-purple-400/10" />
          <div className="h-7 w-20 rounded-lg bg-purple-200/40 dark:bg-purple-400/10" />
        </div>
      ))}
    </div>
  )
}

export function ProblemListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-9 w-full rounded-xl bg-purple-200/40 dark:bg-purple-400/10" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-white/50 bg-white/50 p-3.5 dark:border-white/5 dark:bg-white/5">
          <div className="mb-2 h-4 w-3/4 rounded bg-purple-200/50 dark:bg-purple-400/10" />
          <div className="h-3 w-full rounded bg-purple-200/30 dark:bg-purple-400/5" />
        </div>
      ))}
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <div className="h-7 w-7 rounded-full bg-purple-200/50 dark:bg-purple-400/10" />
          <div className="flex-1">
            <div className="mb-1 h-3 w-20 rounded bg-purple-200/50 dark:bg-purple-400/10" />
            <div className="h-2 w-12 rounded bg-purple-200/30 dark:bg-purple-400/5" />
          </div>
          <div className="h-4 w-8 rounded bg-purple-200/40 dark:bg-purple-400/10" />
        </div>
      ))}
    </div>
  )
}
