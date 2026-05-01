import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../api/client'
import AuthModal from '../auth/AuthModal'
import CodeEditor from './CodeEditor'
import SubmissionPanel from './SubmissionPanel'

const defaultCodes = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    var a, b int\n    fmt.Scan(&a, &b)\n    fmt.Println(a + b)\n}`,
  python: `a, b = map(int, input().split())\nprint(a + b)`,
}

export default function ProblemView({
  problem, onBack, onRefresh,
  code, setCode, language, setLanguage, dark,
}) {
  const { user } = useAuth()
  const toast = useToast()
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('Idle')
  const [runtime, setRuntime] = useState('--')
  const [detailText, setDetailText] = useState('')
  const [subId, setSubId] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setDetail(null)
    setStatus('Idle')
    setDetailText('')
    setRuntime('--')
    setSubId(null)
    setLoading(true)
    loadDetail()
  }, [problem?.id])

  useEffect(() => {
    if (!subId) return
    const timer = setInterval(async () => {
      try {
        const data = await api.getStatus(subId)
        setStatus(data.status)
        setDetailText(data.detail)
        setRuntime(data.runtime || '--')
        if (!['Pending', 'Judging'].includes(data.status)) {
          clearInterval(timer)
          setSubId(null)
          if (data.status === 'Accepted') {
            toast.success(`通过！${data.detail || ''}`)
          } else {
            toast.error(`${data.status}: ${data.detail?.slice(0, 60) || ''}`)
          }
          onRefresh?.()
        }
      } catch { clearInterval(timer) }
    }, 1000)
    return () => clearInterval(timer)
  }, [subId])

  async function loadDetail() {
    if (!problem?.id) { setLoading(false); return }
    try {
      const data = await api.getProblem(problem.id)
      setDetail(data)
    } catch {}
    setLoading(false)
  }

  async function handleSubmit() {
    if (!user) { setShowAuth(true); return }
    if (!problem) return
    setSubId(null)
    setStatus('Pending')
    setDetailText('等待进入判题队列...')
    setRuntime('--')
    toast.info('正在提交代码...')
    try {
      const data = await api.submit(problem.id, language, code)
      setSubId(data.id)
      setStatus(data.status)
      setDetailText(data.detail)
    } catch (err) {
      setStatus('Submit Failed')
      setDetailText('无法连接后端')
      toast.error('提交失败：无法连接后端')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
          <span className="text-sm font-bold opacity-50">加载题目...</span>
        </div>
      </div>
    )
  }

  const samples = detail?.samples || []
  const tags = detail?.tags || problem?.tags || []

  return (
    <div className="flex flex-col gap-4">
      {/* 题目头部 */}
      <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/90">
        <div className="flex items-start justify-between gap-4 max-sm:flex-col">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black">{detail?.title || problem?.title}</h2>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black dark:bg-purple-500/15 dark:text-purple-300">
                #{problem?.id}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed opacity-75 max-w-2xl">
              {detail?.description || problem?.description}
            </p>
            {(detail?.input_desc || detail?.output_desc) && (
              <div className="mt-3 flex flex-wrap gap-6">
                {detail?.input_desc && (
                  <div>
                    <span className="text-[10px] font-black tracking-wider opacity-50">INPUT</span>
                    <p className="mt-0.5 text-sm opacity-80">{detail.input_desc}</p>
                  </div>
                )}
                {detail?.output_desc && (
                  <div>
                    <span className="text-[10px] font-black tracking-wider opacity-50">OUTPUT</span>
                    <p className="mt-0.5 text-sm opacity-80">{detail.output_desc}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t}
                className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 编辑器 + 侧边栏 */}
      <div className="grid grid-cols-[1fr_280px] gap-4 items-start max-lg:grid-cols-1">
        <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/90">
          <CodeEditor value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} dark={dark} />

          {/* 操作栏 */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button onClick={handleSubmit}
              className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50"
              disabled={status === 'Pending' || status === 'Judging'}>
              {status === 'Pending' || status === 'Judging' ? '判题中...' : '提交代码'}
            </button>
            <button onClick={() => setCode(defaultCodes[language])}
              className="rounded-xl border border-pink-200 bg-white/60 px-3.5 py-2 text-xs font-bold text-[#704b84] transition hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
              重置模板
            </button>
            <button onClick={onBack}
              className="rounded-xl border border-pink-200 bg-white/60 px-3.5 py-2 text-xs font-bold text-[#704b84] transition hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
              ← 返回题库
            </button>
          </div>
        </div>

        <div className="max-lg:order-first">
          <SubmissionPanel
            problem={{ ...problem, tags, samples, ...detail }}
            status={status}
            runtime={runtime}
            detail={detailText}
            samples={samples}
          />
        </div>
      </div>

      {/* 判题结果 */}
      {detailText && status !== 'Idle' && (
        <div className="animate-fade-in rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-white/5 dark:bg-[#1e1933]/90">
          <div className="flex items-center gap-3">
            <StatusDot status={status} />
            <span className="text-sm font-bold">判题状态：{status}</span>
            {runtime !== '--' && (
              <>
                <span className="text-xs opacity-40">|</span>
                <span className="text-sm opacity-60">耗时：{runtime}</span>
              </>
            )}
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-sm opacity-80 font-mono text-xs leading-relaxed">
            {detailText}
          </pre>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

function StatusDot({ status }) {
  const s = String(status || '').toLowerCase()
  let color = 'bg-gray-400'
  if (s.includes('accept')) color = 'bg-emerald-400'
  else if (s.includes('pending') || s.includes('judging')) color = 'bg-purple-400 animate-pulse'
  else if (s.includes('wrong') || s.includes('time') || s.includes('runtime')) color = 'bg-red-400'
  else if (s.includes('compile')) color = 'bg-amber-400'
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
}
