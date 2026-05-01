import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { api } from './api/client'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/layout/Header'
import Dashboard from './components/dashboard/Dashboard'

const ProblemView = lazy(() => import('./components/problem/ProblemView'))

const fallbackProblems = [
  { id: 1001, title: 'A + B Problem', description: '输入两个整数，输出它们的和。', tags: ['math'], difficulty: 'Easy', time_limit_ms: 1000, memory_limit_mb: 128 },
  { id: 1002, title: 'Reverse String', description: '输入一个字符串，输出反转后的结果。', tags: ['string'], difficulty: 'Easy', time_limit_ms: 1000, memory_limit_mb: 128 },
]

const defaultCodes = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    var a, b int\n    fmt.Scan(&a, &b)\n    fmt.Println(a + b)\n}`,
  python: `a, b = map(int, input().split())\nprint(a + b)`,
}

function ProblemLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
        <span className="text-sm font-bold opacity-50">加载编辑器...</span>
      </div>
    </div>
  )
}

function AppContent() {
  const [dark, setDark] = useState(false)
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

  const loadProblems = useCallback(async () => {
    try {
      const data = await api.getProblems()
      if (Array.isArray(data) && data.length > 0) {
        setProblems(data)
        setSelected((prev) => data.find((p) => p.id === prev?.id) || data[0])
      }
    } catch {}
  }, [])

  const loadSubmissions = useCallback(async () => {
    try { const d = await api.getSubmissions(); if (Array.isArray(d)) setSubmissions(d) } catch {}
  }, [])

  const loadLeaderboard = useCallback(async () => {
    try { const d = await api.getLeaderboard(); if (Array.isArray(d)) setLeaderboard(d) } catch {}
  }, [])

  const loadContests = useCallback(async () => {
    try { const d = await api.getContests(); if (Array.isArray(d)) setContests(d) } catch {}
  }, [])

  const loadProfile = useCallback(async () => {
    try { setProfile(await api.getProfile()) } catch {}
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadProblems(), loadSubmissions(), loadLeaderboard(), loadContests(), loadProfile()])
    setLoading(false)
  }, [loadProblems, loadSubmissions, loadLeaderboard, loadContests, loadProfile])

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    setCode(defaultCodes[language] || defaultCodes.cpp)
  }, [language])

  const handleSelect = (p) => {
    if (p) {
      setSelected(p)
      setCode(defaultCodes[language] || defaultCodes.cpp)
      setTransitioning(true)
      setView('problem')
      setTimeout(() => setTransitioning(false), 300)
    }
  }

  const handleBack = () => {
    setTransitioning(true)
    setView('dashboard')
    setTimeout(() => setTransitioning(false), 300)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#0f0c1e] text-[#e8dff5]' : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 text-[#3d2e5a]'}`}>
      <div className="mx-auto max-w-[1380px] px-5 py-5 max-sm:px-3">
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
              />
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
