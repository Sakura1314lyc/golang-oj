import { useMemo } from 'react'

export default function ProblemList({ problems, selected, onSelect, query, setQuery }) {
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '')
      return `${p.id} ${p.title} ${tags}`.toLowerCase().includes(query.toLowerCase())
    })
  }, [problems, query])

  return (
    <div className="ark-panel-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="ark-kicker">Archives</div>
          <h2 className="mt-1 text-base font-black">题目列表</h2>
        </div>
        <span className="ark-tag px-2.5 py-1">{problems.length}</span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索题号、标题、标签"
        className="ark-input mb-3 w-full px-3.5 py-2.5 text-sm font-bold placeholder:text-white/35"
      />
      <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-1">
        {filtered.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`w-full border p-3 text-left transition ${
              selected?.id === p.id
                ? 'border-[var(--ark-red)] bg-white/12 shadow-[inset_4px_0_0_var(--ark-red)]'
                : 'border-white/10 bg-white/[0.045] hover:border-[var(--ark-cyan)]/60 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-black">#{p.id} {p.title}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/52">{p.description}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <DifficultyBadge level={p.difficulty} />
                {i === 0 && <span className="ark-tag border-[var(--ark-red)]/50 px-2 py-1 text-[var(--ark-red)]">NEW</span>}
              </div>
            </div>
            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="ark-tag px-2 py-1 text-white/70">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">没有匹配的任务档案</p>
        )}
      </div>
    </div>
  )
}

function DifficultyBadge({ level }) {
  const colors = {
    Easy: 'border-emerald-400/40 text-emerald-300',
    Medium: 'border-amber-400/40 text-amber-300',
    Hard: 'border-red-400/50 text-red-300',
  }
  return (
    <span className={`ark-tag px-2 py-1 ${colors[level] || colors.Easy}`}>
      {level || 'Easy'}
    </span>
  )
}
