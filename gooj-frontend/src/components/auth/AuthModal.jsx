import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') await login(username, password)
      else await register(username, password)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-6 shadow-xl dark:border-white/5 dark:bg-[#1e1933]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex gap-2">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'login' ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm' : 'bg-purple-100/50 text-[#704b84] dark:bg-white/5 dark:text-[#dbcaff]'}`}
            onClick={() => setTab('login')}>
            登录
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'register' ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm' : 'bg-purple-100/50 text-[#704b84] dark:bg-white/5 dark:text-[#dbcaff]'}`}
            onClick={() => setTab('register')}>
            注册
          </button>
          <button onClick={onClose} className="ml-auto rounded-xl px-2 py-1 text-lg opacity-40 hover:opacity-80">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wider opacity-50">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm font-bold text-[#4c3b5e] outline-none focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-[#e8dff5]"
              required minLength={2} autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wider opacity-50">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm font-bold text-[#4c3b5e] outline-none focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-[#e8dff5]"
              required minLength={4}
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-500 dark:bg-red-500/10">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-50">
            {loading ? '处理中...' : (tab === 'login' ? '登录' : '注册')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs opacity-40">默认账号：admin / 123456</p>
      </div>
    </div>
  )
}
