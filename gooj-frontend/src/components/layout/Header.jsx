import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

export default function Header({ dark, setDark, view, setView, onRefresh }) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <header className="mb-5 flex items-center justify-between gap-4 max-lg:flex-wrap max-sm:flex-col max-sm:items-start">
      <button
        onClick={() => setView('dashboard')}
        className="group flex min-w-0 items-center gap-3 text-left"
        title="返回控制台"
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 bg-white/10">
          <div className="absolute left-0 top-0 h-2 w-2 bg-[var(--ark-red)]" />
          <span className="text-lg font-black tracking-tight">G</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-black tracking-tight sm:text-3xl">GOOJ</h1>
            <span className="ark-tag px-2.5 py-1">JUDGE</span>
          </div>
          <div className="ark-kicker mt-0.5">Rhodes Terminal UI</div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-start">
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
          <div className="flex items-center gap-2">
            <span className="ark-tag px-3 py-2">{user.username}</span>
            <button onClick={logout} className="ark-button px-3 py-2 text-xs font-black">
              退出
            </button>
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
