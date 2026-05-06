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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="ark-panel w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center gap-2">
          <button
            className={`px-4 py-2 text-sm font-black transition ${tab === 'login' ? 'ark-button-primary' : 'ark-button'}`}
            onClick={() => setTab('login')}
          >
            登录
          </button>
          <button
            className={`px-4 py-2 text-sm font-black transition ${tab === 'register' ? 'ark-button-primary' : 'ark-button'}`}
            onClick={() => setTab('register')}
          >
            注册
          </button>
          <button onClick={onClose} className="ark-button ml-auto px-3 py-2 text-sm font-black">X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? '处理中...' : (tab === 'login' ? '登录终端' : '注册档案')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/42">默认账号：admin / 123456</p>
      </div>
    </div>
  )
}
