export default function Leaderboard({ users }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black">排行榜</h2>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider dark:bg-purple-500/15 dark:text-purple-300">TOP</span>
      </div>
      <div className="space-y-1.5">
        {users.map((u) => (
          <div key={u.username}
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition hover:bg-white/50 dark:hover:bg-white/5">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${u.rank <= 3
                ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white'
                : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300'}`}>
                {u.rank}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{u.username}</div>
                <div className="text-xs opacity-50">{u.solved_count} solved</div>
              </div>
            </div>
            <div className="shrink-0 text-sm font-black opacity-80">{u.score}</div>
          </div>
        ))}
      </div>
      {users.length === 0 && <p className="py-6 text-center text-sm opacity-40">暂无数据</p>}
    </div>
  )
}
