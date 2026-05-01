import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../auth/AuthProvider'

export function TopbarActions({ hideLogout = false, hideTheme = false }: { hideLogout?: boolean, hideTheme?: boolean }) {
  const { clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const onLogout = async () => {
    setLoggingOut(true)
    try {
      await clearSession()
      navigate('/auth', { replace: true })
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {!hideTheme && <ThemeToggle />}
      <button type="button" className="modulesIconBtn" aria-label="Notifications" title="Notifications">
        <span className="material-symbols-outlined" aria-hidden="true">
          notifications
        </span>
      </button>
      {!hideLogout && (
        <button 
          type="button" 
          className="modulesIconBtn" 
          onClick={onLogout} 
          disabled={loggingOut}
          title="Logout"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
        </button>
      )}
    </div>
  )
}
