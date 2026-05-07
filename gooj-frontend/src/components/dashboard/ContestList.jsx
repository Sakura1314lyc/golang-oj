const statusStyle = {
  Running: 'border-[var(--ark-red)] text-[var(--ark-red)]',
  Upcoming: 'border-[var(--ark-cyan)] text-[var(--ark-cyan)]',
  Ended: 'border-white/20 text-white/45',
}

export default function ContestList({ contests }) {
  return (
    <div className="ark-panel-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="ark-kicker">Operations</div>
          <h2 className="mt-1 text-base font-black">行动合约</h2>
        </div>
        <span className="ark-tag px-2.5 py-1">CONTEST</span>
      </div>
      <div className="space-y-2">
        {contests.slice(0, 3).map((c) => (
          <div key={c.id} className="ark-card-cut border border-white/10 bg-white/[0.045] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-sm font-bold">{c.title}</div>
              <span className={`ark-tag px-2.5 py-1 ${statusStyle[c.status] || statusStyle.Ended}`}>
                {c.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
              <span>{c.problem_ids?.length || 0} 题</span>
              <span>{c.start_at ? new Date(c.start_at).toLocaleString() : '--'}</span>
            </div>
          </div>
        ))}
      </div>
      {contests.length === 0 && (
        <div className="flex flex-col items-center py-8">
          <span className="text-2xl font-black text-white/15">[ ]</span>
          <p className="mt-1 text-xs text-white/30">暂无比赛</p>
        </div>
      )}
    </div>
  )
}
