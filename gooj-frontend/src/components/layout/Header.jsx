import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

export default function Header({ dark, setDark, view, setView, onRefresh }) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const navItems = [
    { id: 'dashboard', label: '作战终端', code: 'CTRL' },
    { id: 'submissions', label: '提交记录', code: 'LOG' },
  ]

  return (
    <header className="mb-5 flex items-center justify-between gap-4 max-lg:flex-wrap max-sm:flex-col max-sm:items-start">
      <button
        onClick={() => setView('dashboard')}
        className="group flex min-w-0 items-center gap-3 text-left"
        title="返回 ark-OJ 控制台"
      >
        <div className="ark-logo-mark shrink-0 text-white">
          <span className="relative z-10 text-xl font-black tracking-tight">A</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-black tracking-tight sm:text-3xl">ark-OJ</h1>
            <span className="ark-tag px-2.5 py-1">TACTICAL JUDGE</span>
          </div>
          <div className="ark-kicker mt-0.5">Rhodes-Style Operations Console</div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-start">
        <div className="flex flex-wrap border border-white/12 bg-black/25 p-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-3 py-1.5 text-xs font-black transition ${
                view === item.id
                  ? 'bg-white text-black'
                  : 'text-white/58 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1 text-[10px] opacity-55">{item.code}</span>
              {item.label}
            </button>
          ))}
        </div>

        {view === 'problem' && (
          <button onClick={() => setView('dashboard')} className="ark-button px-3.5 py-2 text-xs font-black">
            题库
          </button>
        )}
        <button onClick={() => setDark(!dark)} className="ark-button px-3.5 py-2 text-xs font-black">
          {dark ? '日间' : '夜战'}
        </button>
        <button onClick={onRefresh} className="ark-button px-3.5 py-2 text-xs font-black">
          刷新
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="ark-button-primary flex items-center gap-2 px-3 py-2 text-xs font-black"
            >
              <span className="grid h-5 w-5 place-items-center bg-black/20 text-[10px] font-black">
                {user.username[0].toUpperCase()}
              </span>
              {user.username}
            </button>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="ark-panel-soft absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden">
                  <div className="border-b border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center bg-[var(--ark-red)] text-sm font-black text-white">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{user.username}</div>
                        <div className="truncate text-xs text-white/50">{user.email || '未绑定邮箱'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-white/10">
                    {[
                      { label: '已解决', value: user.solved_count ?? 0 },
                      { label: '提交', value: user.submit_count ?? 0 },
                      { label: 'Rating', value: user.rating ?? 1200 },
                    ].map((s) => (
                      <div key={s.label} className="bg-[var(--ark-panel)] p-2.5 text-center">
                        <div className="text-sm font-black">{s.value}</div>
                        <div className="text-[10px] text-white/45">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowProfile(false); setView('submissions') }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-white/70 hover:bg-white/10"
                    >
                      我的提交
                    </button>
                    <button
                      onClick={() => { logout(); setShowProfile(false) }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-red-300 hover:bg-white/10"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => setShowAuth(true)} className="ark-button-primary px-4 py-2 text-xs font-black">
              登录
            </button>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          </>
        )}
      </div>
    </header>
  )
}
