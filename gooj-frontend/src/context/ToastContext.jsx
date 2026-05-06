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
      <div className="fixed bottom-6 right-6 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up border px-4 py-3 text-sm font-bold shadow-lg backdrop-blur ${
              t.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-900/70 text-emerald-100'
                : t.type === 'error'
                  ? 'border-red-400/50 bg-red-950/75 text-red-100'
                  : 'border-[var(--ark-cyan)]/45 bg-slate-950/75 text-cyan-100'
            }`}
          >
            <span className="mr-2 text-white/60">
              {t.type === 'success' ? 'OK' : t.type === 'error' ? 'ERR' : 'INFO'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
