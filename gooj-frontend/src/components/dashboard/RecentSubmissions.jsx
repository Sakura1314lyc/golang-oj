const statusColors = {
  accepted: 'border-emerald-400/40 text-emerald-300',
  wrong: 'border-red-400/50 text-red-300',
  pending: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  judging: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  compile: 'border-amber-400/45 text-amber-300',
}

function getStatusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('accept')) return statusColors.accepted
  if (s.includes('wrong')) return statusColors.wrong
  if (s.includes('pending') || s.includes('judging')) return statusColors.judging
  if (s.includes('compile')) return statusColors.compile
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
        {submissions.slice(0, 6).map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between gap-2 border border-transparent px-3 py-2 transition hover:border-white/10 hover:bg-white/[0.055]"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{sub.problem_name || `#${sub.problem_id}`}</div>
              <div className="text-xs text-white/45">#{sub.id} / {(sub.language || 'cpp').toUpperCase()} / {sub.runtime || '--'}</div>
            </div>
            <span className={`ark-tag shrink-0 px-2.5 py-1 ${getStatusStyle(sub.status)}`}>{sub.status}</span>
          </div>
        ))}
      </div>
      {submissions.length === 0 && <p className="py-6 text-center text-sm text-white/40">暂无提交记录</p>}
    </div>
  )
}
