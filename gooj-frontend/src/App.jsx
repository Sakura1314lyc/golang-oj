import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:8080/api'

const fallbackProblems = [
  { id: 1001, title: 'A + B Problem', description: '输入两个整数，输出它们的和。', tags: ['math', 'implementation'], difficulty: 'Easy', time_limit_ms: 1000, memory_limit_mb: 128 },
  { id: 1002, title: 'Reverse String', description: '输入一个字符串，输出反转后的结果。', tags: ['string'], difficulty: 'Easy', time_limit_ms: 1000, memory_limit_mb: 128 },
]

const initialCodeMap = {
  1001: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
  1002: `#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}`,
}

function getDefaultCode(problemId) {
  return initialCodeMap[problemId] || `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`
}

function getStatusColor(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('accept')) return ['#dcfce7', '#166534']
  if (s.includes('pending') || s.includes('judging') || s.includes('idle')) return ['#ede9fe', '#6d28d9']
  if (s.includes('wrong')) return ['#fee2e2', '#b91c1c']
  if (s.includes('compile')) return ['#fef3c7', '#92400e']
  if (s.includes('runtime') || s.includes('time limit') || s.includes('system') || s.includes('submit failed')) return ['#ffe4e6', '#be123c']
  return ['#f3e8ff', '#6b21a8']
}

function styles(dark) {
  return {
    page: {
      minHeight: '100vh',
      background: dark
        ? 'linear-gradient(180deg, #221a38 0%, #140f22 100%)'
        : 'linear-gradient(180deg, #fff8fc 0%, #f8f4ff 48%, #f6fbff 100%)',
      color: dark ? '#f7f1ff' : '#4c3b5e',
      padding: '20px',
      fontFamily: 'Inter, system-ui, Arial, sans-serif',
    },
    shell: {
      width: '100%',
      maxWidth: '1320px',
      margin: '0 auto',
    },
    banner: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '30px',
      padding: '26px 28px',
      marginBottom: '16px',
      background: dark
        ? 'linear-gradient(135deg, rgba(251,113,133,0.12), rgba(139,92,246,0.18), rgba(25,20,39,0.96))'
        : 'linear-gradient(135deg, rgba(255,243,248,0.98), rgba(246,240,255,0.98), rgba(241,249,255,0.98))',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f3e3ef',
      boxShadow: dark ? '0 18px 40px rgba(0,0,0,0.22)' : '0 16px 34px rgba(167,139,250,0.08)',
    },
    bannerTop: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: '18px',
    },
    brandCenter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    title: {
      margin: 0,
      fontSize: '38px',
      lineHeight: 1.05,
      fontWeight: 900,
      letterSpacing: '-0.045em',
    },
    subtitle: {
      marginTop: '8px',
      fontSize: '12px',
      fontWeight: 800,
      letterSpacing: '0.18em',
      opacity: 0.7,
    },
    eventText: {
      marginTop: '12px',
      fontSize: '15px',
      opacity: 0.82,
    },
    bannerButtons: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    topLink: {
      border: 'none',
      background: 'transparent',
      color: dark ? '#f4e8ff' : '#7a5c92',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: '14px',
      padding: '8px 10px',
    },
    softButton: {
      border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ead8f2',
      background: dark ? 'rgba(255,255,255,0.04)' : '#ffffffcc',
      color: dark ? '#f4e8ff' : '#704b84',
      padding: '10px 16px',
      borderRadius: '999px',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: '14px',
    },
    primaryButton: {
      border: 'none',
      background: 'linear-gradient(135deg, #fb7185, #a78bfa)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: '999px',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: '14px',
      boxShadow: '0 10px 22px rgba(244,114,182,0.18)',
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '14px',
      marginBottom: '16px',
    },
    statCard: {
      borderRadius: '22px',
      padding: '18px 16px',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.92)',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #efe2f2',
      boxShadow: dark ? '0 12px 28px rgba(0,0,0,0.16)' : '0 12px 24px rgba(167,139,250,0.05)',
      textAlign: 'center',
    },
    statLine: {
      width: '48px',
      height: '4px',
      borderRadius: '999px',
      margin: '0 auto 12px',
      background: 'linear-gradient(90deg, #fda4af, #c4b5fd)',
    },
    statLabel: {
      fontSize: '13px',
      opacity: 0.72,
      marginBottom: '8px',
      fontWeight: 700,
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 900,
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '280px minmax(0, 1fr) 280px',
      gap: '16px',
      alignItems: 'start',
    },
    problemPage: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
    },
    widePanel: {
      background: dark ? 'rgba(37,30,59,0.92)' : 'rgba(255,255,255,0.94)',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eee2f0',
      borderRadius: '26px',
      padding: '20px',
      boxShadow: dark ? '0 16px 34px rgba(0,0,0,0.18)' : '0 16px 30px rgba(167,139,250,0.05)',
    },
    panel: {
      background: dark ? 'rgba(37,30,59,0.92)' : 'rgba(255,255,255,0.94)',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eee2f0',
      borderRadius: '26px',
      padding: '18px',
      boxShadow: dark ? '0 16px 34px rgba(0,0,0,0.18)' : '0 16px 30px rgba(167,139,250,0.05)',
    },
    panelTitleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      marginBottom: '12px',
    },
    panelTitle: {
      fontSize: '18px',
      fontWeight: 900,
    },
    label: {
      fontSize: '11px',
      fontWeight: 800,
      letterSpacing: '0.14em',
      color: dark ? '#dbcaff' : '#9b5de5',
      background: dark ? 'rgba(255,255,255,0.06)' : '#f3e8ff',
      padding: '6px 10px',
      borderRadius: '999px',
    },
    search: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '12px 14px',
      borderRadius: '15px',
      outline: 'none',
      background: dark ? 'rgba(255,255,255,0.05)' : '#fffbfd',
      color: dark ? '#f5e4ff' : '#6a4f7f',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0d9e7',
      marginBottom: '12px',
      fontSize: '14px',
      fontWeight: 600,
    },
    questCard: (active) => ({
      borderRadius: '20px',
      padding: '14px',
      marginBottom: '12px',
      cursor: 'pointer',
      border: active ? '1px solid #f5b7d7' : (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f2e0ec'),
      background: active
        ? (dark ? 'linear-gradient(135deg, rgba(251,113,133,0.12), rgba(167,139,250,0.14))' : 'linear-gradient(135deg, #fff4f9, #f6f1ff)')
        : (dark ? 'rgba(255,255,255,0.03)' : '#fffefe'),
    }),
    questTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    questDifficulty: {
      fontSize: '11px',
      letterSpacing: '0.1em',
      fontWeight: 800,
      opacity: 0.7,
    },
    questBadge: {
      padding: '4px 9px',
      borderRadius: '999px',
      background: dark ? 'rgba(255,192,203,0.12)' : '#ffe6f0',
      color: dark ? '#ffd2eb' : '#c2185b',
      fontSize: '11px',
      fontWeight: 800,
    },
    questTitle: {
      fontSize: '16px',
      fontWeight: 900,
      marginBottom: '6px',
    },
    questDesc: {
      fontSize: '13px',
      lineHeight: 1.55,
      opacity: 0.8,
    },
    tag: {
      display: 'inline-flex',
      marginTop: '10px',
      padding: '6px 11px',
      borderRadius: '999px',
      background: dark ? 'rgba(196,181,253,0.14)' : '#efe9ff',
      color: dark ? '#ddd6fe' : '#7c3aed',
      fontWeight: 800,
      fontSize: '12px',
    },
    centerHero: {
      borderRadius: '22px',
      padding: '18px',
      marginBottom: '14px',
      background: dark ? 'linear-gradient(135deg, rgba(251,113,133,0.08), rgba(167,139,250,0.12), rgba(255,255,255,0.02))' : 'linear-gradient(135deg, #fff5fa, #f6f2ff, #f5fbff)',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f2e0ec',
    },
    heroTitle: {
      fontSize: '24px',
      fontWeight: 900,
      textAlign: 'center',
    },
    heroDesc: {
      marginTop: '6px',
      fontSize: '14px',
      opacity: 0.8,
      textAlign: 'center',
    },
    heroMeta: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '12px',
    },
    chip: (bg, color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 12px',
      borderRadius: '999px',
      background: bg,
      color,
      fontWeight: 800,
      fontSize: '12px',
    }),
    subGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '14px',
      alignItems: 'start',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '14px',
      alignItems: 'start',
    },
    editorHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      flexWrap: 'wrap',
      marginBottom: '12px',
    },
    codeFrame: {
      borderRadius: '22px',
      padding: '12px',
      background: dark ? 'rgba(16,14,29,0.7)' : '#fffafd',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0dfec',
    },
    codeBox: {
      width: '100%',
      minHeight: '520px',
      boxSizing: 'border-box',
      resize: 'vertical',
      borderRadius: '18px',
      padding: '16px',
      outline: 'none',
      background: dark ? '#1a1530' : '#fffefe',
      color: dark ? '#f7eaff' : '#58486b',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #efdeea',
      fontFamily: 'Consolas, Monaco, monospace',
      fontSize: '16px',
      lineHeight: 1.85,
      whiteSpace: 'pre',
      overflowX: 'auto',
      tabSize: 2,
    },
    submitRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '14px',
    },
    detail: {
      marginTop: '12px',
      padding: '11px 13px',
      borderRadius: '16px',
      fontSize: '13px',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff8fc',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f3dce9',
      color: dark ? '#f3e2ff' : '#6b597b',
    },
    sampleCard: {
      borderRadius: '20px',
      padding: '14px',
      background: dark ? 'rgba(255,255,255,0.03)' : '#fffefe',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1dfec',
    },
    sampleTitle: {
      fontSize: '15px',
      fontWeight: 900,
      marginBottom: '8px',
    },
    pre: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: 'Consolas, Monaco, monospace',
      fontSize: '12px',
      lineHeight: 1.6,
      margin: 0,
      background: dark ? 'rgba(255,255,255,0.03)' : '#faf7fd',
      border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1e4ee',
      borderRadius: '14px',
      padding: '10px',
      color: dark ? '#f3e8ff' : '#5e4e73',
    },
    sideSection: {
      marginBottom: '18px',
    },
    sideItem: {
      padding: '14px',
      borderRadius: '18px',
      marginBottom: '10px',
      background: dark ? 'rgba(255,255,255,0.03)' : '#fffefe',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1dfec',
    },
    rankCircle: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: dark ? 'linear-gradient(135deg, #f9a8d4, #c4b5fd)' : 'linear-gradient(135deg, #ffe6f0, #ebe1ff)',
      color: dark ? '#48264a' : '#7c3f6f',
      fontWeight: 900,
      marginRight: '10px',
      fontSize: '13px',
      flexShrink: 0,
    },
    sideMeta: {
      marginTop: '6px',
      fontSize: '12px',
      opacity: 0.72,
    },
    contestStatus: (status) => ({
      display: 'inline-flex',
      padding: '5px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 800,
      background: status === 'Running' ? '#dcfce7' : status === 'Upcoming' ? '#ede9fe' : '#f3f4f6',
      color: status === 'Running' ? '#166534' : status === 'Upcoming' ? '#6d28d9' : '#374151',
    }),
  }
}

export default function App() {
  const [dark, setDark] = useState(false)
  const s = styles(dark)

  const [problems, setProblems] = useState(fallbackProblems)
  const [selected, setSelected] = useState(fallbackProblems[0])
  const [problemDetail, setProblemDetail] = useState(null)
  const [query, setQuery] = useState('')
  const [code, setCode] = useState(getDefaultCode(fallbackProblems[0].id))
  const [status, setStatus] = useState('Idle')
  const [detail, setDetail] = useState('')
  const [runtime, setRuntime] = useState('--')
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null)
  const [view, setView] = useState('dashboard')

  const [submissions, setSubmissions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [contests, setContests] = useState([])
  const [profile, setProfile] = useState({ username: 'Ravi', rating: 1280, solved_count: 0, submit_count: 0, accepted_count: 0 })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selected?.id) return
    setCode(getDefaultCode(selected.id))
    loadProblemDetail(selected.id)
  }, [selected?.id])

  useEffect(() => {
    if (!currentSubmissionId) return
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${currentSubmissionId}`)
        const data = await res.json()
        setStatus(data.status || 'Unknown')
        setDetail(data.detail || '')
        setRuntime(data.runtime || '--')
        if (!['Pending', 'Judging'].includes(data.status)) {
          loadSubmissions()
          loadLeaderboard()
          loadProfile()
          clearInterval(timer)
        }
      } catch {
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [currentSubmissionId])

  async function loadInitialData() {
    await Promise.all([
      loadProblems(),
      loadSubmissions(),
      loadLeaderboard(),
      loadContests(),
      loadProfile(),
    ])
  }

  async function loadProblems() {
    try {
      const res = await fetch(`${API_BASE}/problems`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setProblems(data)
        setSelected((prev) => prev ? (data.find((p) => p.id === prev.id) || data[0]) : data[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadProblemDetail(problemId) {
    try {
      const res = await fetch(`${API_BASE}/problems/${problemId}`)
      const data = await res.json()
      if (res.ok) setProblemDetail(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadSubmissions() {
    try {
      const res = await fetch(`${API_BASE}/submissions`)
      const data = await res.json()
      if (Array.isArray(data)) setSubmissions(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadLeaderboard() {
    try {
      const res = await fetch(`${API_BASE}/leaderboard`)
      const data = await res.json()
      if (Array.isArray(data)) setLeaderboard(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadContests() {
    try {
      const res = await fetch(`${API_BASE}/contests`)
      const data = await res.json()
      if (Array.isArray(data)) setContests(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile`)
      const data = await res.json()
      if (res.ok) setProfile(data)
    } catch (e) {
      console.error(e)
    }
  }

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const tagsText = Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '')
      return `${p.id} ${p.title} ${tagsText} ${p.description || p.desc || ''}`.toLowerCase().includes(query.toLowerCase())
    })
  }, [problems, query])

  async function submit() {
    if (!selected) return
    setStatus('Pending')
    setDetail('等待进入判题队列')
    setRuntime('--')
    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: selected.id,
          language: 'cpp',
          code,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('Submit Failed')
        setDetail(data.error || '提交失败')
        return
      }
      setCurrentSubmissionId(data.id)
      setStatus(data.status || 'Pending')
      setDetail(data.detail || '')
      loadSubmissions()
    } catch {
      setStatus('Submit Failed')
      setDetail('无法连接后端')
    }
  }

  const [statusBg, statusColor] = getStatusColor(status)
  const currentProblem = problemDetail || selected || fallbackProblems[0]
  const currentTags = Array.isArray(currentProblem.tags) ? currentProblem.tags : [currentProblem.tags].filter(Boolean)
  const recentContests = contests.slice(0, 2)
  const recentSubmissions = submissions.slice(0, 4)
  const topUsers = leaderboard.slice(0, 3)

  const openProblem = (p) => {
    setSelected(p)
    setView('problem')
  }

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <div style={s.banner}>
          <div style={s.bannerTop}>
            <div style={s.brandCenter}>
              <h1 style={s.title}>RaviOj</h1>
              <div style={s.subtitle}>ONLINE JUDGE PLATFORM</div>
              <div style={s.eventText}>代码提交、题目训练、比赛排行与状态轮询</div>
            </div>
            <div style={s.bannerButtons}>
              {view === 'problem' ? <button style={s.topLink} onClick={() => setView('dashboard')}>← 返回题目列表</button> : null}
              <button style={s.softButton} onClick={() => setDark((v) => !v)}>{dark ? '切换浅色' : '切换夜色'}</button>
              <button style={s.primaryButton} onClick={loadInitialData}>刷新数据</button>
            </div>
          </div>
        </div>

        <div style={s.stats}>
          <div style={s.statCard}><div style={s.statLine} /><div style={s.statLabel}>当前用户</div><div style={s.statValue}>{profile.username}</div></div>
          <div style={s.statCard}><div style={s.statLine} /><div style={s.statLabel}>已解决题目</div><div style={s.statValue}>{profile.solved_count ?? 0}</div></div>
          <div style={s.statCard}><div style={s.statLine} /><div style={s.statLabel}>总提交数</div><div style={s.statValue}>{profile.submit_count ?? submissions.length}</div></div>
          <div style={s.statCard}><div style={s.statLine} /><div style={s.statLabel}>当前 Rating</div><div style={s.statValue}>{profile.rating ?? 1280}</div></div>
        </div>

        {view === 'dashboard' ? (
          <div style={s.mainGrid}>
            <div style={s.panel}>
              <div style={s.panelTitleRow}>
                <div style={s.panelTitle}>题目列表</div>
                <div style={s.label}>PROBLEMS</div>
              </div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='搜索题号、标题、标签...' style={s.search} />
              {filteredProblems.map((p, index) => {
                const tags = Array.isArray(p.tags) ? p.tags : [p.tags].filter(Boolean)
                return (
                  <div key={p.id} style={s.questCard(selected?.id === p.id)} onClick={() => openProblem(p)}>
                    <div style={s.questTop}>
                      <div style={s.questDifficulty}>{p.difficulty || 'EASY'}</div>
                      {index === 0 ? <div style={s.questBadge}>HOT</div> : <div style={{ width: 38 }} />}
                    </div>
                    <div style={s.questTitle}>{p.id}. {p.title}</div>
                    <div style={s.questDesc}>{p.description || p.desc}</div>
                    {tags[0] ? <span style={s.tag}>{tags[0]}</span> : null}
                  </div>
                )
              })}
            </div>

            <div style={s.panel}>
              <div style={s.centerHero}>
                <div style={s.heroTitle}>{currentProblem.title}</div>
                <div style={s.heroDesc}>{currentProblem.description || currentProblem.desc}</div>
                <div style={s.heroMeta}>
                  {currentTags.map((tag) => <span key={tag} style={s.tag}>{tag}</span>)}
                  <span style={s.chip('#dbeafe', '#1d4ed8')}>C++17</span>
                  <span style={s.chip(statusBg, statusColor)}>状态：{status}</span>
                  <span style={s.chip('#fae8ff', '#86198f')}>耗时：{runtime}</span>
                  <span style={s.chip('#fdf2f8', '#be185d')}>时限：{currentProblem.time_limit_ms || 1000} ms</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '22px 0 6px' }}>
                <button style={s.primaryButton} onClick={() => setView('problem')}>进入大编辑器模式</button>
              </div>
            </div>

            <div style={s.panel}>
              <div style={s.sideSection}>
                <div style={s.panelTitleRow}>
                  <div style={s.panelTitle}>排行榜</div>
                  <div style={s.label}>RANK</div>
                </div>
                {topUsers.map((u) => (
                  <div key={u.username} style={s.sideItem}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        <span style={s.rankCircle}>{u.rank}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: '14px' }}>{u.username}</div>
                          <div style={s.sideMeta}>Solved {u.solved_count} problems</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '14px' }}>{u.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={s.problemPage}>
            <div style={s.widePanel}>
              <div style={s.centerHero}>
                <div style={s.heroTitle}>{currentProblem.title}</div>
                <div style={s.heroDesc}>{currentProblem.description || currentProblem.desc}</div>
                <div style={s.heroMeta}>
                  {currentTags.map((tag) => <span key={tag} style={s.tag}>{tag}</span>)}
                  <span style={s.chip('#dbeafe', '#1d4ed8')}>C++17</span>
                  <span style={s.chip(statusBg, statusColor)}>状态：{status}</span>
                  <span style={s.chip('#fae8ff', '#86198f')}>耗时：{runtime}</span>
                  <span style={s.chip('#fdf2f8', '#be185d')}>时限：{currentProblem.time_limit_ms || 1000} ms</span>
                </div>
              </div>

              <div style={s.subGrid}>
                <div>
                  <div style={s.editorHeader}>
                    <div style={s.panelTitle}>代码编辑器</div>
                    <div style={s.label}>FULL EDITOR</div>
                  </div>
                  <div style={s.codeFrame}>
                    <textarea style={s.codeBox} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
                  </div>
                  <div style={s.submitRow}>
                    <button style={s.primaryButton} onClick={submit}>提交代码</button>
                    <button style={s.softButton} onClick={() => setCode(getDefaultCode(currentProblem.id))}>重置模板</button>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>当前题目：#{currentProblem.id}</div>
                  </div>
                  {detail ? <div style={s.detail}>判题信息：{detail}</div> : null}
                </div>

                <div style={s.infoGrid}>
                  <div style={s.sampleCard}>
                    <div style={s.sampleTitle}>题目信息</div>
                    <div style={s.sideMeta}>难度：{currentProblem.difficulty || 'Easy'}</div>
                    <div style={s.sideMeta}>内存限制：{currentProblem.memory_limit_mb || 128} MB</div>
                    <div style={s.sideMeta}>当前状态：{status}</div>
                  </div>

                  <div style={s.sampleCard}>
                    <div style={s.sampleTitle}>样例输入</div>
                    <pre style={s.pre}>{currentProblem.samples?.[0]?.input || '暂无样例'}</pre>
                  </div>

                  <div style={s.sampleCard}>
                    <div style={s.sampleTitle}>样例输出</div>
                    <pre style={s.pre}>{currentProblem.samples?.[0]?.output || '暂无样例'}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
