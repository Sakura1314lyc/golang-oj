import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken as saveToken, getAuthHeaders } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gooj_token')
    if (token) {
      api.getProfile()
        .then(setUser)
        .catch(() => { localStorage.removeItem('gooj_token'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const data = await api.login(username, password)
    saveToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (username, password) => {
    const data = await api.register(username, password)
    saveToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    saveToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
