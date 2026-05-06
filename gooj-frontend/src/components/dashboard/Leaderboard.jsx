export default function Leaderboard({ users }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="ark-kicker">Ranking</div>
          <h2 className="mt-1 text-base font-black">排行榜</h2>
        </div>
        <span className="ark-tag px-2.5 py-1">TOP</span>
      </div>
      <div className="space-y-1.5">
        {users.map((u) => (
          <div
            key={u.username}
            className="flex items-center justify-between gap-2 border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.055]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-black ${
                u.rank <= 3
                  ? 'bg-[var(--ark-red)] text-white'
                  : 'border border-white/15 bg-white/5 text-white/65'
              }`}>
                {u.rank}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{u.username}</div>
                <div className="text-xs text-white/45">{u.solved_count} solved · {u.accepted_count || 0} AC</div>
              </div>
            </div>
            <div className="shrink-0 text-sm font-black text-[var(--ark-cyan)]">{u.score || u.rating}</div>
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <div className="flex flex-col items-center py-8">
          <span className="text-2xl font-black text-white/15">&lt;/&gt;</span>
          <p className="mt-1 text-xs text-white/30">排行榜暂无数据</p>
        </div>
      )}
    </div>
  )
}
