function getStatusColor(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('accept')) return 'border-emerald-400/40 text-emerald-300'
  if (s.includes('pending') || s.includes('judging')) return 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]'
  if (s.includes('wrong')) return 'border-red-400/50 text-red-300'
  if (s.includes('compile')) return 'border-amber-400/45 text-amber-300'
  if (s.includes('time limit')) return 'border-red-400/50 text-red-300'
  return 'border-white/20 text-white/55'
}

export default function SubmissionPanel({ problem, status, runtime, detail, samples }) {
  const statusColor = getStatusColor(status)

  return (
    <div className="space-y-3">
      <div className="ark-panel-soft p-4">
        <div className="ark-kicker">Status</div>
        <div className="mt-1 text-sm font-black">{problem.title}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.isArray(problem.tags) && problem.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          <Chip className={statusColor}>状态：{status}</Chip>
          <Chip>耗时：{runtime}</Chip>
          <Chip>时限：{problem.time_limit_ms || 1000}ms</Chip>
        </div>
      </div>

      <div className="ark-panel-soft p-4">
        <div className="ark-kicker">Spec</div>
        <div className="mt-2 space-y-2 text-xs text-white/68">
          <div className="flex justify-between gap-3"><span>难度</span><strong>{problem.difficulty || 'Easy'}</strong></div>
          <div className="flex justify-between gap-3"><span>内存</span><strong>{problem.memory_limit_mb || 128} MB</strong></div>
          <div className="flex justify-between gap-3"><span>状态</span><strong>{status}</strong></div>
        </div>
      </div>

      {Array.isArray(samples) && samples.length > 0 && (
        <>
          <SampleBlock title="样例输入" value={samples[0]?.input || '暂无'} />
          <SampleBlock title="样例输出" value={samples[0]?.output || '暂无'} />
        </>
      )}

      {detail && (
        <div className="ark-panel-soft p-4">
          <div className="ark-kicker">Judge Detail</div>
          <pre className="mt-2 whitespace-pre-wrap border border-white/10 bg-black/25 p-3 font-mono text-xs leading-relaxed text-white/74">
            {detail}
          </pre>
        </div>
      )}
    </div>
  )
}

function SampleBlock({ title, value }) {
  return (
    <div className="ark-panel-soft p-4">
      <div className="ark-kicker">{title}</div>
      <pre className="mt-2 overflow-x-auto border border-white/10 bg-black/25 p-3 font-mono text-xs leading-relaxed text-white/74">
        {value}
      </pre>
    </div>
  )
}

function Chip({ children, className = '' }) {
  return (
    <span className={`ark-tag px-2.5 py-1 ${className || 'text-white/72'}`}>
      {children}
    </span>
  )
}
