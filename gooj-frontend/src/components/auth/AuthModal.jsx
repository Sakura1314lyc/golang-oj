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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/68 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="ark-panel w-full max-w-sm overflow-hidden p-6" onClick={(e) => e.stopPropagation()}>
        <div className="absolute right-0 top-0 h-12 w-24 bg-white/5 [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)]" />
        <div className="relative mb-5 flex items-center gap-2">
          <div className="mr-auto">
            <div className="ark-kicker">Access Terminal</div>
            <h2 className="mt-1 text-lg font-black">ark-OJ 账号档案</h2>
          </div>
          <button onClick={onClose} className="ark-button px-3 py-2 text-sm font-black">X</button>
        </div>

        <div className="relative mb-5 grid grid-cols-2 gap-1 border border-white/12 bg-black/20 p-1">
          <button
            className={`px-4 py-2 text-sm font-black transition ${tab === 'login' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setTab('login')}
          >
            登录
          </button>
          <button
            className={`px-4 py-2 text-sm font-black transition ${tab === 'register' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setTab('register')}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div>
            <label className="ark-kicker mb-1 block">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="ark-input w-full px-4 py-2.5 text-sm font-bold"
              required
              minLength={2}
              autoFocus
            />
          </div>
          <div>
            <label className="ark-kicker mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ark-input w-full px-4 py-2.5 text-sm font-bold"
              required
              minLength={4}
            />
          </div>
          {error && <p className="border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="ark-button-primary w-full py-2.5 text-sm font-black disabled:opacity-50"
          >
            {loading ? '处理中...' : (tab === 'login' ? '接入终端' : '建立档案')}
          </button>
        </form>

        <p className="relative mt-4 text-center text-xs text-white/42">默认账号：admin / 123456</p>
      </div>
    </div>
  )
}
