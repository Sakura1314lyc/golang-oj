export default function StatCards({ profile, submissionCount, problemCount }) {
  const stats = [
    { label: '当前用户', value: profile?.username || 'GUEST', tone: 'cyan' },
    { label: '已解决', value: profile?.solved_count ?? 0, tone: 'red' },
    { label: '总提交', value: profile?.submit_count ?? submissionCount, tone: 'amber' },
    { label: '题目档案', value: problemCount ?? '--', tone: 'white' },
  ]

  return (
    <div className="mb-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {stats.map((s, index) => (
        <div key={s.label} className="ark-panel-soft group overflow-hidden p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="ark-kicker">{s.label}</span>
            <span className="text-xs font-black text-white/25">0{index + 1}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 truncate text-2xl font-black tracking-tight">{s.value}</div>
            <div className={`h-8 w-1.5 ${
              s.tone === 'cyan' ? 'bg-[var(--ark-cyan)]' :
                s.tone === 'red' ? 'bg-[var(--ark-red)]' :
                  s.tone === 'amber' ? 'bg-[var(--ark-amber)]' : 'bg-white/45'
            }`} />
          </div>
        </div>
      ))}
    </div>
  )
}
