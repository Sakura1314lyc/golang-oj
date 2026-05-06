export default function StatCards({ profile, submissionCount, problemCount }) {
  const stats = [
    { label: '当前用户', value: profile?.username || 'GUEST', tone: 'cyan', code: 'USR', sub: profile?.role || 'visitor' },
    { label: '已解决', value: profile?.solved_count ?? 0, tone: 'red', code: 'AC', sub: `Rating ${profile?.rating || 1200}` },
    { label: '通过/提交', value: profile?.accepted_count ?? 0, tone: 'amber', code: 'SUB', sub: `${profile?.submit_count ?? submissionCount} total` },
    { label: '题目档案', value: problemCount ?? '--', tone: 'white', code: 'ARC', sub: 'in database' },
  ]

  return (
    <div className="mb-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {stats.map((s, index) => (
        <div key={s.label} className="ark-panel-soft group overflow-hidden p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="ark-kicker">{s.label}</span>
            <span className="border border-white/15 px-2 py-1 text-[10px] font-black text-white/36">{s.code}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="min-w-0 truncate text-3xl font-black tracking-tight">{s.value}</div>
              <div className="mt-1 text-[10px] font-black text-white/28">{s.sub}</div>
            </div>
            <div className={`h-11 w-2 ${
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
