import { useState, useEffect, useCallback } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

const STATUS_FILTERS = [
  { label: '全部', value: '' },
  { label: '通过', value: 'Accepted' },
  { label: '错误', value: 'Wrong Answer' },
  { label: '超时', value: 'Time Limit Exceeded' },
  { label: '编译错误', value: 'Compile Error' },
  { label: '运行错误', value: 'Runtime Error' },
]

const statusColors = {
  accepted: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/8',
  wrong: 'border-red-400/50 text-red-300 bg-red-500/8',
  pending: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)] bg-cyan-500/8',
  judging: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)] bg-cyan-500/8',
  compile: 'border-amber-400/45 text-amber-300 bg-amber-500/8',
  'time limit': 'border-orange-400/45 text-orange-300 bg-orange-500/8',
  'memory limit': 'border-purple-400/45 text-purple-300 bg-purple-500/8',
}

function getStatusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('accept')) return statusColors.accepted
  if (s.includes('wrong')) return statusColors.wrong
  if (s.includes('pending') || s.includes('judging')) return statusColors.judging
  if (s.includes('compile')) return statusColors.compile
  if (s.includes('time limit')) return statusColors['time limit']
  if (s.includes('memory limit')) return statusColors['memory limit']
  return 'border-white/20 text-white/55'
}

export default function SubmissionsView({ onBack }) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const pageSize = 15

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      const res = await api.getMySubmissions(params)
      setSubmissions(res.data || [])
      if (res.pagination) {
        setTotal(res.pagination.total || 0)
      }
    } catch {
      setSubmissions([])
    }
    setLoading(false)
  }, [user, page, statusFilter])

  useEffect(() => { loadSubmissions() }, [loadSubmissions])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (!user) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="ark-panel p-8 text-center">
          <div className="ark-kicker">Access Denied</div>
          <p className="mt-3 text-sm text-white/60">请先登录以查看提交记录</p>
          <button
            onClick={() => setShowAuth(true)}
            className="ark-button-primary mt-4 px-5 py-2.5 text-sm font-black"
          >
            登录
          </button>
          <button onClick={onBack} className="ark-button ml-3 px-4 py-2.5 text-xs font-black">
            返回
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="ark-kicker">Submissions Log</div>
          <h2 className="mt-1 text-2xl font-black">我的提交记录</h2>
        </div>
        <button onClick={onBack} className="ark-button px-3.5 py-2 text-xs font-black">
          返回题库
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={`ark-tag cursor-pointer px-3 py-1.5 text-xs font-black transition ${
              statusFilter === f.value
                ? 'border-[var(--ark-red)] bg-red-500/10 text-[var(--ark-red)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ark-panel-soft flex animate-pulse items-center gap-4 p-4">
              <div className="h-4 w-16 bg-white/10" />
              <div className="h-4 flex-1 bg-white/10" />
              <div className="h-4 w-20 bg-white/10" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="ark-panel py-12 text-center">
          <div className="ark-kicker">Empty Log</div>
          <p className="mt-2 text-sm text-white/50">暂无提交记录</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="ark-panel-soft flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.04] max-md:flex-wrap"
            >
              <span className="w-16 text-xs font-bold text-white/40">#{sub.id}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">
                    #{sub.problem_id} {sub.problem_name}
                  </span>
                  <span className="text-[10px] uppercase text-white/35">{(sub.language || 'cpp')}</span>
                </div>
                <div className="mt-1 text-xs text-white/35">
                  {sub.created_at ? new Date(sub.created_at).toLocaleString() : '--'}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`ark-tag px-2.5 py-1 text-xs ${getStatusStyle(sub.status)}`}>
                  {sub.status}
                </span>
                <span className="text-xs text-white/40">{sub.runtime || '--'} / {sub.memory || '--'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="ark-button px-3 py-1.5 text-xs font-black disabled:opacity-30"
          >
            上一页
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`ark-tag cursor-pointer px-2.5 py-1 text-xs font-black ${
                    page === p ? 'border-[var(--ark-red)] text-[var(--ark-red)]' : 'text-white/50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="ark-button px-3 py-1.5 text-xs font-black disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
