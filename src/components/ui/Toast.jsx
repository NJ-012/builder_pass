import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'

const ToastContext = createContext(null)

const ICONS = { ok: 'check', err: 'alert', info: 'info' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const seq = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    ({ title, desc, tone = 'info', duration = 4200 }) => {
      const id = ++seq.current
      setToasts((list) => [...list.slice(-2), { id, title, desc, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      )
      return id
    },
    [dismiss]
  )

  useEffect(() => {
    const store = timers.current
    return () => store.forEach(clearTimeout)
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`} role="status">
            <Icon name={ICONS[t.tone] || 'info'} size="1.1em" className="toast__icon" />
            <div className="toast__body">
              <div className="toast__title">{t.title}</div>
              {t.desc && <div className="toast__desc">{t.desc}</div>}
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <Icon name="close" size="0.95em" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
