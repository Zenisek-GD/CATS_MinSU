import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { Icon } from './IconMap'
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
        <Icon name="notifications" size={20} />
      </button>
      {!hideLogout && (
        <button 
          type="button" 
          className="modulesIconBtn" 
          onClick={onLogout} 
          disabled={loggingOut}
          title="Logout"
        >
          <Icon name="logout" size={20} />
        </button>
      )}
    </div>
  )
}
