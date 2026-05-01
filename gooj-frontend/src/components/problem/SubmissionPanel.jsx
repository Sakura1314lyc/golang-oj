function getStatusColor(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('accept')) return ['bg-emerald-100 text-emerald-700', 'dark:bg-emerald-500/15 dark:text-emerald-300']
  if (s.includes('pending') || s.includes('judging')) return ['bg-purple-100 text-purple-700', 'dark:bg-purple-500/15 dark:text-purple-300']
  if (s.includes('wrong')) return ['bg-red-100 text-red-700', 'dark:bg-red-500/15 dark:text-red-300']
  if (s.includes('compile')) return ['bg-amber-100 text-amber-700', 'dark:bg-amber-500/15 dark:text-amber-300']
  if (s.includes('time limit')) return ['bg-red-100 text-red-700', 'dark:bg-red-500/15 dark:text-red-300']
  return ['bg-gray-100 text-gray-600', 'dark:bg-gray-500/15 dark:text-gray-400']
}

export default function SubmissionPanel({ problem, status, runtime, detail, samples }) {
  const [statusBg, statusColor] = getStatusColor(status)

  return (
    <div className="space-y-3">
      {/* 状态卡片 */}
      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
        <div className="mb-2 text-sm font-black">{problem.title}</div>
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(problem.tags) && problem.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          <Chip className={statusBg}>状态：{status}</Chip>
          <Chip>耗时：{runtime}</Chip>
          <Chip>时限：{problem.time_limit_ms || 1000}ms</Chip>
        </div>
      </div>

      {/* 题目信息 */}
      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
        <div className="mb-2 text-sm font-black">题目信息</div>
        <div className="space-y-1 text-xs opacity-70">
          <div>难度：{problem.difficulty || 'Easy'}</div>
          <div>内存：{problem.memory_limit_mb || 128} MB</div>
          <div>状态：{status}</div>
        </div>
      </div>

      {/* 样例 */}
      {Array.isArray(samples) && samples.length > 0 && (
        <>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
            <div className="mb-2 text-sm font-black">样例输入</div>
            <pre className="overflow-x-auto rounded-xl border border-purple-100 bg-purple-50/50 p-3 font-mono text-xs leading-relaxed dark:border-white/5 dark:bg-white/5">
              {samples[0]?.input || '暂无'}
            </pre>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
            <div className="mb-2 text-sm font-black">样例输出</div>
            <pre className="overflow-x-auto rounded-xl border border-purple-100 bg-purple-50/50 p-3 font-mono text-xs leading-relaxed dark:border-white/5 dark:bg-white/5">
              {samples[0]?.output || '暂无'}
            </pre>
          </div>
        </>
      )}

      {/* 判题详情 */}
      {detail && (
        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/80">
          <div className="mb-1 text-sm font-black">判题详情</div>
          <pre className="whitespace-pre-wrap text-xs font-mono opacity-80 leading-relaxed">{detail}</pre>
        </div>
      )}
    </div>
  )
}

function Chip({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black dark:bg-purple-500/15 ${className || 'text-purple-700 dark:text-purple-300'}`}>
      {children}
    </span>
  )
}
