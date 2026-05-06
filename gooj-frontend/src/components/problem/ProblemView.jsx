import { useCallback, useState, useEffect } from 'react'
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

  const loadDetail = useCallback(async () => {
    if (!problem?.id) {
      setLoading(false)
      return
    }
    try {
      const data = await api.getProblem(problem.id)
      setDetail(data)
    } catch {
      // Fallback problem content remains visible if the API is offline.
    }
    setLoading(false)
  }, [problem])

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
            toast.success(`通过：${data.detail || ''}`)
          } else {
            toast.error(`${data.status}: ${data.detail?.slice(0, 60) || ''}`)
          }
          onRefresh?.()
        }
      } catch {
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [subId, onRefresh, toast])

  useEffect(() => {
    setDetail(null)
    setStatus('Idle')
    setDetailText('')
    setRuntime('--')
    setSubId(null)
    setLoading(true)
    loadDetail()
  }, [problem?.id, loadDetail])

  async function handleSubmit() {
    if (!user) {
      setShowAuth(true)
      return
    }
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
    } catch {
      setStatus('Submit Failed')
      setDetailText('无法连接后端')
      toast.error('提交失败：无法连接后端')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="ark-panel px-10 py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin border-2 border-white/20 border-t-[var(--ark-red)]" />
          <span className="mt-4 block text-sm font-bold text-white/55">正在加载题目档案...</span>
        </div>
      </div>
    )
  }

  const samples = detail?.samples || []
  const tags = detail?.tags || problem?.tags || []

  return (
    <div className="flex flex-col gap-4">
      <div className="ark-panel overflow-hidden p-6">
        <div className="absolute inset-y-0 right-0 hidden w-64 bg-[url('/assets/operator-terminal.png')] bg-cover bg-right opacity-28 lg:block" />
        <div className="absolute inset-y-0 right-0 hidden w-96 bg-gradient-to-l from-transparent to-[#12161b] lg:block" />
        <div className="relative flex items-start justify-between gap-4 max-sm:flex-col">
          <div className="min-w-0 flex-1">
            <div className="ark-kicker">Problem Archive</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight">{detail?.title || problem?.title}</h2>
              <span className="ark-tag px-2.5 py-1">#{problem?.id}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
              {detail?.description || problem?.description}
            </p>
            {(detail?.input_desc || detail?.output_desc) && (
              <div className="mt-4 grid max-w-4xl grid-cols-2 gap-4 max-md:grid-cols-1">
                {detail?.input_desc && (
                  <div className="border-l-4 border-[var(--ark-cyan)] bg-white/[0.045] p-3">
                    <span className="ark-kicker">INPUT</span>
                    <p className="mt-1 text-sm text-white/70">{detail.input_desc}</p>
                  </div>
                )}
                {detail?.output_desc && (
                  <div className="border-l-4 border-[var(--ark-red)] bg-white/[0.045] p-3">
                    <span className="ark-kicker">OUTPUT</span>
                    <p className="mt-1 text-sm text-white/70">{detail.output_desc}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative flex shrink-0 flex-wrap justify-end gap-1.5">
            {tags.map((t) => (
              <span key={t} className="ark-tag px-2.5 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] items-start gap-4 max-lg:grid-cols-1">
        <div className="ark-panel-soft p-5">
          <CodeEditor value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} dark={dark} />

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSubmit}
              className="ark-button-primary px-6 py-2.5 text-sm font-black disabled:opacity-50"
              disabled={status === 'Pending' || status === 'Judging'}
            >
              {status === 'Pending' || status === 'Judging' ? '判题中...' : '提交代码'}
            </button>
            <button onClick={() => setCode(defaultCodes[language])} className="ark-button px-3.5 py-2 text-xs font-black">
              重置模板
            </button>
            <button onClick={onBack} className="ark-button px-3.5 py-2 text-xs font-black">
              返回题库
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

      {detailText && status !== 'Idle' && (
        <div className="ark-panel-soft animate-fade-in p-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusDot status={status} />
            <span className="text-sm font-black">判题状态：{status}</span>
            {runtime !== '--' && (
              <>
                <span className="text-xs text-white/30">/</span>
                <span className="text-sm text-white/60">耗时：{runtime}</span>
              </>
            )}
          </div>
          <pre className="mt-3 whitespace-pre-wrap border border-white/10 bg-black/25 p-3 font-mono text-xs leading-relaxed text-white/74">
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
  else if (s.includes('pending') || s.includes('judging')) color = 'bg-[var(--ark-cyan)] animate-pulse'
  else if (s.includes('wrong') || s.includes('time') || s.includes('runtime')) color = 'bg-[var(--ark-red)]'
  else if (s.includes('compile')) color = 'bg-[var(--ark-amber)]'
  return <span className={`inline-block h-2.5 w-2.5 ${color}`} />
}
