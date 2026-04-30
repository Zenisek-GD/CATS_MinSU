import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forgotPassword,
  loginWithEmail,
  registerWithEmail,
} from '../api/auth'
import { useAuth } from '../auth/AuthProvider'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const navigate = useNavigate()
  const { setSession, token, isReady } = useAuth()

  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitLabel = useMemo(() => {
    if (mode === 'login') return 'Login'
    return 'Create account'
  }, [mode])

  useEffect(() => {
    if (isReady && token) {
      navigate('/modules', { replace: true })
    }
  }, [isReady, token, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)

    try {
      const safeEmail = email.trim()
      if (!safeEmail) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      if (mode === 'login') {
        const resp = await loginWithEmail(safeEmail, password)
        setSession(resp)
        navigate('/modules', { replace: true })
        return
      }

      const resp = await registerWithEmail({
        name: name.trim() || undefined,
        email: safeEmail,
        password,
      })
      setSession(resp)
      navigate('/modules', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function onForgotPassword() {
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      const safeEmail = email.trim()
      if (!safeEmail) throw new Error('Enter your email first.')
      const resp = await forgotPassword(safeEmail)
      setMessage(resp.message)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>CATS</h1>
        <p className="muted">Login or create an account.</p>

        <div className="tabs" role="tablist" aria-label="Auth mode">
          <button
            className="tab"
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className="tab"
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {message ? <div className="error">{message}</div> : null}

        <form className="form" onSubmit={onSubmit}>
          {mode === 'register' ? (
            <div className="row">
              <label htmlFor="name">Name (optional)</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={busy}
              />
            </div>
          ) : null}

          <div className="row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
            />
          </div>

          <div className="row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={busy}
            />
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : submitLabel}
            </button>

            {mode === 'login' ? (
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={onForgotPassword}
              >
                Forgot password
              </button>
            ) : (
              <span className="muted">&nbsp;</span>
            )}
          </div>

          <p className="muted">
            Dev tip: for local dev, run backend on port 8000, then start Vite.
          </p>
        </form>
      </div>
    </div>
  )
}
