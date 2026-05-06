import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg) => addToast(msg, 'error', 5000), [addToast])
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex max-w-[420px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up border-l-4 px-4 py-3 text-sm font-bold shadow-2xl backdrop-blur ${
              t.type === 'success'
                ? 'border-l-emerald-400 border-white/20 bg-emerald-900/85 text-emerald-100'
                : t.type === 'error'
                  ? 'border-l-[var(--ark-red)] border-white/20 bg-red-950/85 text-red-100'
                  : 'border-l-[var(--ark-cyan)] border-white/20 bg-slate-950/85 text-cyan-100'
            }`}
          >
            <span className="mr-2 text-xs uppercase tracking-wider text-white/50">
              {t.type === 'success' ? '✓ OK' : t.type === 'error' ? '✗ ERR' : 'ℹ INFO'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
