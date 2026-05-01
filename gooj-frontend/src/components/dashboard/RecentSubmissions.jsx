const statusColors = {
  accepted: ['bg-emerald-100 text-emerald-700', 'dark:bg-emerald-500/15 dark:text-emerald-300'],
  wrong: ['bg-red-100 text-red-700', 'dark:bg-red-500/15 dark:text-red-300'],
  pending: ['bg-purple-100 text-purple-700', 'dark:bg-purple-500/15 dark:text-purple-300'],
  judging: ['bg-purple-100 text-purple-700', 'dark:bg-purple-500/15 dark:text-purple-300'],
  compile: ['bg-amber-100 text-amber-700', 'dark:bg-amber-500/15 dark:text-amber-300'],
}

function getStatusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('accept')) return statusColors.accepted
  if (s.includes('wrong')) return statusColors.wrong
  if (s.includes('pending') || s.includes('judging')) return statusColors.judging
  if (s.includes('compile')) return statusColors.compile
  return ['bg-gray-100 text-gray-600', 'dark:bg-gray-500/15 dark:text-gray-400']
}

export default function RecentSubmissions({ submissions }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black">最近提交</h2>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider dark:bg-purple-500/15 dark:text-purple-300">LOG</span>
      </div>
      <div className="space-y-1.5">
        {submissions.slice(0, 6).map((sub) => {
          const [light, dark] = getStatusStyle(sub.status)
          return (
            <div key={sub.id}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition hover:bg-white/50 dark:hover:bg-white/5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{sub.problem_name || `#${sub.problem_id}`}</div>
                <div className="text-xs opacity-50">#{sub.id} · {(sub.language || 'cpp').toUpperCase()} · {sub.runtime || '--'}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${light} ${dark}`}>{sub.status}</span>
            </div>
          )
        })}
      </div>
      {submissions.length === 0 && <p className="py-6 text-center text-sm opacity-40">暂无提交记录</p>}
    </div>
  )
}
