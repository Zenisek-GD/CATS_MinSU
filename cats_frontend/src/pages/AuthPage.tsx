import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forgotPassword,
  loginWithEmail,
  registerWithEmail,
} from '../api/auth'
import { useAuth } from '../auth/AuthProvider'
import './AuthPage.css'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const navigate = useNavigate()
  const { setSession, token, isReady, user } = useAuth()

  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitLabel = useMemo(() => {
    if (mode === 'login') return 'Sign In'
    return 'Create Account'
  }, [mode])

  useEffect(() => {
    if (isReady && token && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/modules', { replace: true })
    }
  }, [isReady, token, user, navigate])

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
        const dest = resp.user.role === 'admin' ? '/admin/dashboard' : '/modules'
        navigate(dest, { replace: true })
        return
      }

      if (mode === 'register' && !name.trim()) {
        throw new Error('Name is required for registration.')
      }

      const resp = await registerWithEmail({
        name: name.trim() || undefined,
        email: safeEmail,
        password,
      })
      setSession(resp)
      const dest = resp.user.role === 'admin' ? '/admin/dashboard' : '/modules'
      navigate(dest, { replace: true })
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
    <div className="authPage">
      <div className="authCard">
        {/* Brand */}
        <div className="authBrand">
          <div className="authLogo">
            <span className="material-symbols-outlined">security</span>
          </div>
          <h1 className="authBrandTitle">CATS Platform</h1>
          <p className="authBrandSub">Cyber Awareness Training System — MinSU</p>
        </div>

        {/* Tabs */}
        <div className="authTabs" role="tablist" aria-label="Auth mode">
          <button
            className={`authTab ${mode === 'login' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => { setMode('login'); setError(null); setMessage(null) }}
          >
            Sign In
          </button>
          <button
            className={`authTab ${mode === 'register' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => { setMode('register'); setError(null); setMessage(null) }}
          >
            Register
          </button>
        </div>

        {/* Messages */}
        {error && <div className="authError">{error}</div>}
        {message && <div className="authSuccess">{message}</div>}

        {/* Form */}
        <form className="authForm" onSubmit={onSubmit}>
          {mode === 'register' && (
            <div className="authField">
              <label className="authLabel" htmlFor="auth-name">Full Name</label>
              <input
                className="authInput"
                id="auth-name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={busy}
              />
            </div>
          )}

          <div className="authField">
            <label className="authLabel" htmlFor="auth-email">Email Address</label>
            <input
              className="authInput"
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
            />
          </div>

          <div className="authField">
            <label className="authLabel" htmlFor="auth-password">Password</label>
            <input
              className="authInput"
              id="auth-password"
              type="password"
              placeholder={mode === 'register' ? 'Create a secure password' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={busy}
            />
          </div>

          <div className="authActions">
            <button className="authSubmitBtn" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : submitLabel}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                className="authForgotBtn"
                disabled={busy}
                onClick={onForgotPassword}
              >
                Forgot your password?
              </button>
            )}
          </div>
        </form>

        <div className="authFooter">
          © {new Date().getFullYear()} MinSU — Cyber Awareness Training System
        </div>
      </div>
    </div>
  )
}
