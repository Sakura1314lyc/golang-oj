import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { api } from './api/client'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/layout/Header'
import Dashboard from './components/dashboard/Dashboard'
import SubmissionsView from './components/submissions/SubmissionsView'

const ProblemView = lazy(() => import('./components/problem/ProblemView'))

const fallbackProblems = [
  {
    id: 1001,
    title: 'A + B Problem',
    description: '输入两个整数，输出它们的和。',
    tags: ['math'],
    difficulty: 'Easy',
    time_limit_ms: 1000,
    memory_limit_mb: 128,
  },
  {
    id: 1002,
    title: 'Reverse String',
    description: '输入一个字符串，输出反转后的结果。',
    tags: ['string'],
    difficulty: 'Easy',
    time_limit_ms: 1000,
    memory_limit_mb: 128,
  },
]

const defaultCodes = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    var a, b int\n    fmt.Scan(&a, &b)\n    fmt.Println(a + b)\n}`,
  python: `a, b = map(int, input().split())\nprint(a + b)`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n        sc.close();\n    }\n}`,
  javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const [a, b] = line.split(' ').map(Number);\n    console.log(a + b);\n    rl.close();\n});`,
}

function AppFooter() {
  return (
    <footer className="mt-10 border-t border-white/8 pb-6 pt-6 text-center text-xs text-white/25">
      <span className="font-bold">ArkOJ</span> Tactical Judge Terminal &mdash;
      <span className="ml-1">基于 Go + React 构建 · v1.0</span>
    </footer>
  )
}

function ProblemLoader() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="ark-panel px-10 py-8 text-center">
        <div className="mx-auto h-9 w-9 animate-spin border-2 border-white/20 border-t-[var(--ark-red)]" />
        <div className="mt-4 ark-kicker">Loading Editor</div>
        <p className="mt-1 text-sm text-white/55">正在调度代码终端...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const [dark, setDark] = useState(true)
  const [view, setView] = useState('dashboard')
  const [problems, setProblems] = useState(fallbackProblems)
  const [selected, setSelected] = useState(fallbackProblems[0])
  const [query, setQuery] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [contests, setContests] = useState([])
  const [profile, setProfile] = useState(null)
  const [code, setCode] = useState(defaultCodes.cpp)
  const [language, setLanguage] = useState('cpp')
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  const loadProblems = useCallback(async (search = '') => {
    try {
      const params = {}
      if (search) params.q = search
      const data = await api.getProblems(params)
      if (Array.isArray(data) && data.length > 0) {
        setProblems(data)
        if (!search) {
          setSelected((prev) => data.find((p) => p.id === prev?.id) || data[0])
        }
      } else if (Array.isArray(data) && data.length === 0 && !search) {
        // keep fallback data when API returns empty on first load
      }
    } catch {
      // Use bundled fallback data when the API is unavailable.
    }
  }, [])

  const loadSubmissions = useCallback(async () => {
    try {
      const d = await api.getSubmissions()
      if (Array.isArray(d)) setSubmissions(d)
    } catch {
      // Empty lists keep the dashboard usable offline.
    }
  }, [])

  const loadLeaderboard = useCallback(async () => {
    try {
      const d = await api.getLeaderboard()
      if (Array.isArray(d)) setLeaderboard(d)
    } catch {
      // Empty lists keep the dashboard usable offline.
    }
  }, [])

  const loadContests = useCallback(async () => {
    try {
      const d = await api.getContests()
      if (Array.isArray(d)) setContests(d)
    } catch {
      // Empty lists keep the dashboard usable offline.
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await api.getProfile())
    } catch {
      // Guest mode is fine when the profile endpoint is unavailable.
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadProblems(), loadSubmissions(), loadLeaderboard(), loadContests(), loadProfile()])
    setLoading(false)
  }, [loadProblems, loadSubmissions, loadLeaderboard, loadContests, loadProfile])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    setCode(defaultCodes[language] || defaultCodes.cpp)
  }, [language])

  const handleSelect = (p) => {
    if (!p) return
    setSelected(p)
    setCode(defaultCodes[language] || defaultCodes.cpp)
    setTransitioning(true)
    setView('problem')
    setTimeout(() => setTransitioning(false), 260)
  }

  const handleBack = () => {
    setTransitioning(true)
    setView('dashboard')
    setTimeout(() => setTransitioning(false), 260)
  }

  return (
    <div className={`ark-shell ${dark ? '' : 'ark-day'}`}>
      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-5 max-sm:px-3">
        <Header dark={dark} setDark={setDark} view={view} setView={setView} onRefresh={loadAll} />

        <ErrorBoundary>
          <div className={`transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
            {view === 'dashboard' ? (
              <Dashboard
                problems={problems}
                selected={selected}
                onSelect={handleSelect}
                query={query}
                setQuery={setQuery}
                profile={profile}
                leaderboard={leaderboard}
                submissions={submissions}
                contests={contests}
                loading={loading}
                onSearch={loadProblems}
              />
            ) : view === 'submissions' ? (
              <SubmissionsView onBack={() => setView('dashboard')} />
            ) : (
              <Suspense fallback={<ProblemLoader />}>
                <ProblemView
                  problem={selected}
                  onBack={handleBack}
                  onRefresh={loadAll}
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  dark={dark}
                />
              </Suspense>
            )}
          </div>
        </ErrorBoundary>
        <AppFooter />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}
