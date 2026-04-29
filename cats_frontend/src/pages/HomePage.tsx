import { useState } from 'react'
import { getAdminMe } from '../api/auth'
import { useAuth } from '../auth/AuthProvider'

export default function HomePage() {
  const { user, refreshMe, clearSession } = useAuth()
  const [adminCheck, setAdminCheck] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onRefresh() {
    setBusy(true)
    try {
      await refreshMe()
    } finally {
      setBusy(false)
    }
  }

  async function onAdminCheck() {
    setAdminCheck(null)
    setBusy(true)
    try {
      const data = await getAdminMe()
      setAdminCheck(`Admin OK: ${data.user.email}`)
    } catch {
      setAdminCheck('Admin endpoint denied (not admin).')
    } finally {
      setBusy(false)
    }
  }

  async function onLogout() {
    setBusy(true)
    try {
      await clearSession()
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <strong>{user.name}</strong>
          <div className="muted">{user.email}</div>
        </div>
        <button className="btn secondary" type="button" onClick={onLogout} disabled={busy}>
          Logout
        </button>
      </div>

      <div className="content">
        <h1 style={{ margin: 0, fontSize: 28 }}>Welcome</h1>
        <p className="muted">Role: {user.role}</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="btn" type="button" onClick={onRefresh} disabled={busy}>
            Refresh profile
          </button>
          <button className="btn secondary" type="button" onClick={onAdminCheck} disabled={busy}>
            Test admin endpoint
          </button>
        </div>

        {adminCheck ? <div style={{ marginTop: 12 }} className="error">{adminCheck}</div> : null}

        <div style={{ marginTop: 18 }}>
          <p className="muted">API check:</p>
          <pre
            style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 12,
              overflowX: 'auto',
              color: 'var(--text-h)',
              fontFamily: 'var(--mono)',
              fontSize: 14,
            }}
          >
            {JSON.stringify({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              participant_code: user.participant_code,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
