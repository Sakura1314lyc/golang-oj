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
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n        sc.close();\n    }\n}`,
  javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const [a, b] = line.split(' ').map(Number);\n    console.log(a + b);\n    rl.close();\n});`,
}

const statusColors = {
  accepted: 'border-emerald-400/40 text-emerald-300',
  wrong: 'border-red-400/50 text-red-300',
  pending: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  judging: 'border-[var(--ark-cyan)]/45 text-[var(--ark-cyan)]',
  compile: 'border-amber-400/45 text-amber-300',
  'time limit': 'border-orange-400/45 text-orange-300',
  'memory limit': 'border-purple-400/45 text-purple-300',
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
  const [pastSubs, setPastSubs] = useState([])
  const [showPastSubs, setShowPastSubs] = useState(false)

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
    if (user) {
      try {
        const subRes = await api.getSubmissions({ problem_id: problem.id, page_size: 10 })
        setPastSubs(subRes.data || [])
      } catch {
        setPastSubs([])
      }
    }
    setLoading(false)
  }, [problem, user])

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
      <div className="ark-panel min-h-[270px] overflow-hidden p-6">
        <div className="absolute inset-0 bg-[url('/assets/ark-oj-ops-card.png')] bg-cover bg-center opacity-78" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101419]/98 via-[#101419]/86 to-[#101419]/44" />
        <div className="ark-alert-tape absolute bottom-0 left-0 h-2 w-full" />
        <div className="absolute right-4 top-4 border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-black text-white/34">
          DOC-{problem?.id || '----'}
        </div>
        <div className="relative flex items-start justify-between gap-4 max-sm:flex-col">
          <div className="min-w-0 flex-1">
            <div className="ark-kicker">Problem Archive / ark-OJ</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight max-sm:text-2xl">{detail?.title || problem?.title}</h2>
              <span className="ark-tag px-2.5 py-1">#{problem?.id}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
              {detail?.description || problem?.description}
            </p>
            {(detail?.input_desc || detail?.output_desc) && (
              <div className="mt-4 grid max-w-4xl grid-cols-2 gap-4 max-md:grid-cols-1">
                {detail?.input_desc && (
                  <div className="ark-card-cut border-l-4 border-[var(--ark-cyan)] bg-black/28 p-3">
                    <span className="ark-kicker">INPUT</span>
                    <p className="mt-1 text-sm text-white/70">{detail.input_desc}</p>
                  </div>
                )}
                {detail?.output_desc && (
                  <div className="ark-card-cut border-l-4 border-[var(--ark-red)] bg-black/28 p-3">
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

      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-4 max-lg:grid-cols-1">
        <div className="ark-panel-soft p-5">
          <CodeEditor value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} dark={dark} />

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSubmit}
              className="ark-corner-label px-6 py-2.5 text-sm font-black disabled:opacity-50"
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

        <div className="space-y-3 max-lg:order-first">
          <div className="ark-image-panel relative hidden min-h-[230px] overflow-hidden lg:block">
            <img src="/assets/ark-oj-operator.png" alt="ark-OJ operator portrait" className="absolute inset-0 h-full w-full object-cover object-[center_18%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="ark-kicker">Judge Operator</div>
              <div className="mt-1 text-sm font-black">提交状态监控中</div>
            </div>
          </div>
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

      {user && pastSubs.length > 0 && (
        <div className="ark-panel-soft animate-fade-in overflow-hidden">
          <button
            onClick={() => setShowPastSubs(!showPastSubs)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <span className="ark-kicker">History</span>
              <span className="text-sm font-black">历史提交</span>
              <span className="ark-tag px-2 py-0.5 text-[10px]">{pastSubs.length}</span>
            </div>
            <span className={`text-xs text-white/40 transition ${showPastSubs ? 'rotate-180' : ''}`}>v</span>
          </button>
          {showPastSubs && (
            <div className="border-t border-white/10">
              {pastSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm transition last:border-0 hover:bg-white/[0.03] max-md:flex-wrap"
                >
                  <span className="w-12 text-xs text-white/35">#{sub.id}</span>
                  <span className={`ark-tag flex-1 px-2 py-0.5 text-[10px] ${getStatusStyle(sub.status)}`}>
                    {sub.status}
                  </span>
                  <span className="text-xs uppercase text-white/40">{sub.language}</span>
                  <span className="text-xs text-white/40">{sub.runtime || '--'}</span>
                  <span className="text-xs text-white/30">
                    {sub.created_at ? new Date(sub.created_at).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
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
  else if (s.includes('pending') || s.includes('judging')) color = 'animate-pulse bg-[var(--ark-cyan)]'
  else if (s.includes('wrong') || s.includes('time') || s.includes('runtime')) color = 'bg-[var(--ark-red)]'
  else if (s.includes('compile')) color = 'bg-[var(--ark-amber)]'
  return <span className={`inline-block h-2.5 w-2.5 ${color}`} />
}
