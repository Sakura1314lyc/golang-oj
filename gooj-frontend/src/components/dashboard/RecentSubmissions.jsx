const statusColors = {
  accepted: 'border-emerald-400/40 text-emerald-300',
  wrong: 'border-red-400/50 text-red-300',
  pending: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  judging: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  compile: 'border-amber-400/45 text-amber-300',
  'time limit': 'border-orange-400/45 text-orange-300',
  'memory limit': 'border-purple-400/45 text-purple-300',
}

function getStatusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('accept')) return statusColors.accepted
  if (s.includes('wrong')) return statusColors.wrong
  if (s.includes('pending') || s.includes('judging')) return statusColors.judging
  if (s.includes('compile')) return statusColors.compile
  if (s.includes('time limit')) return statusColors['time limit']
  if (s.includes('memory limit')) return statusColors['memory limit']
  return 'border-white/20 text-white/50'
}

export default function RecentSubmissions({ submissions }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="ark-kicker">Telemetry</div>
          <h2 className="mt-1 text-base font-black">最近提交</h2>
        </div>
        <span className="ark-tag px-2.5 py-1">LOG</span>
      </div>
      <div className="space-y-1.5">
        {submissions.slice(0, 8).map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between gap-2 border border-transparent px-3 py-2 transition hover:border-white/10 hover:bg-white/[0.055]"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{sub.problem_name || `#${sub.problem_id}`}</div>
              <div className="flex gap-2 text-xs text-white/45">
                <span>#{sub.id}</span>
                <span className="uppercase">{sub.language || 'cpp'}</span>
                <span>{sub.runtime || '--'}</span>
                <span>{sub.memory || '--'}</span>
              </div>
            </div>
            <span className={`ark-tag shrink-0 px-2.5 py-1 ${getStatusStyle(sub.status)}`}>{sub.status}</span>
          </div>
        ))}
      </div>
      {submissions.length === 0 && (
        <div className="flex flex-col items-center py-8">
          <span className="text-2xl font-black text-white/15">--</span>
          <p className="mt-1 text-xs text-white/30">暂无提交记录</p>
        </div>
      )}
    </div>
  )
}
