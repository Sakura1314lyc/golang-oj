const statusStyle = {
  Running: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm',
  Upcoming: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  Ended: 'bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-400',
}

export default function ContestList({ contests }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black">比赛列表</h2>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider dark:bg-purple-500/15 dark:text-purple-300">CONTESTS</span>
      </div>
      <div className="space-y-2">
        {contests.slice(0, 3).map((c) => (
          <div key={c.id} className="rounded-xl border border-white/50 bg-white/60 p-3.5 dark:border-white/5 dark:bg-white/5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold">{c.title}</div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${statusStyle[c.status] || statusStyle.Ended}`}>
                {c.status}
              </span>
            </div>
            <div className="mt-1.5 flex gap-4 text-xs opacity-60">
              <span>{c.problem_ids?.length || 0} 题</span>
              <span>{c.start_at ? new Date(c.start_at).toLocaleString() : '--'}</span>
            </div>
          </div>
        ))}
      </div>
      {contests.length === 0 && <p className="py-6 text-center text-sm opacity-40">暂无比赛</p>}
    </div>
  )
}
