import { useMemo } from 'react'

export default function ProblemList({ problems, selected, onSelect, query, setQuery }) {
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '')
      return `${p.id} ${p.title} ${tags}`.toLowerCase().includes(query.toLowerCase())
    })
  }, [problems, query])

  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black">题目列表</h2>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-wider dark:bg-purple-500/15 dark:text-purple-300">{problems.length}</span>
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索题号、标题..."
        className="mb-3 w-full rounded-xl border border-pink-200 bg-white/70 px-3.5 py-2.5 text-sm font-bold text-[#4c3b5e] outline-none placeholder:text-sm placeholder:font-normal placeholder:opacity-40 focus:border-purple-300 dark:border-white/10 dark:bg-white/5 dark:text-[#e8dff5]" />
      <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-1">
        {filtered.map((p, i) => (
          <div key={p.id} onClick={() => onSelect(p)}
            className={`cursor-pointer rounded-xl border p-3.5 transition hover:shadow-sm ${selected?.id === p.id
              ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-500/30 dark:from-purple-500/10 dark:to-pink-500/10'
              : 'border-transparent bg-white/60 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-black">{p.id}. {p.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed opacity-60 line-clamp-2">{p.description}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <DifficultyBadge level={p.difficulty} />
                {i === 0 && <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-black text-pink-600 dark:bg-pink-500/20 dark:text-pink-300">NEW</span>}
              </div>
            </div>
            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.tags.slice(0, 2).map((t) => (
                  <span key={t}
                    className="rounded-full bg-purple-100/60 px-2 py-0.5 text-[10px] font-black text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm opacity-40">无匹配题目</p>
        )}
      </div>
    </div>
  )
}

function DifficultyBadge({ level }) {
  const colors = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${colors[level] || colors.Easy}`}>
      {level || 'Easy'}
    </span>
  )
}
