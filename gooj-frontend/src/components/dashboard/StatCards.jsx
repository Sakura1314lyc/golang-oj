export default function StatCards({ profile, submissionCount }) {
  const stats = [
    { label: '当前用户', value: profile?.username || '--', icon: '→' },
    { label: '已解决', value: profile?.solved_count ?? 0, icon: '✓' },
    { label: '总提交', value: profile?.submit_count ?? submissionCount, icon: '↗' },
    { label: 'Rating', value: profile?.rating ?? 1200, icon: '★' },
  ]

  return (
    <div className="mb-5 grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label}
          className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm transition hover:shadow-md dark:border-white/5 dark:bg-[#1e1933]/80">
          <div className="absolute right-3 top-3 text-lg opacity-20 transition group-hover:opacity-40 dark:text-white">{s.icon}</div>
          <div className="mb-0.5 text-xs font-bold tracking-wider opacity-50">{s.label}</div>
          <div className="text-2xl font-black tracking-tight">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
