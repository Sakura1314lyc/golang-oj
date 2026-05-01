import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

export default function Header({ dark, setDark, view, setView, onRefresh }) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <header className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-black tracking-tighter">GOOJ</h1>
          <span className="hidden rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black tracking-widest sm:inline-block dark:bg-purple-500/15 dark:text-purple-300">
            JUDGE
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {view === 'problem' && (
          <button onClick={() => setView('dashboard')}
            className="rounded-xl border border-pink-200 bg-white/70 px-3.5 py-2 text-xs font-bold text-[#704b84] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
            ← 题库
          </button>
        )}
        <button onClick={() => setDark(!dark)}
          className="rounded-xl border border-pink-200 bg-white/70 px-3.5 py-2 text-xs font-bold text-[#704b84] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
          {dark ? '☀' : '☾'}
        </button>
        <button onClick={onRefresh}
          className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.97]">
          刷新
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-purple-100 px-3 py-1.5 text-xs font-bold dark:bg-purple-500/15 dark:text-purple-300">
              {user.username}
            </span>
            <button onClick={logout}
              className="rounded-xl border border-pink-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#704b84] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
              退出
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => setShowAuth(true)}
              className="rounded-xl border border-pink-200 bg-white/70 px-3.5 py-2 text-xs font-bold text-[#704b84] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#dbcaff] dark:hover:bg-white/10">
              登录
            </button>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          </>
        )}
      </div>
    </header>
  )
}
