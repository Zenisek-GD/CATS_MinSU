import { useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { forgotPassword, loginWithEmail, registerWithEmail, type Role } from '../api/auth'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import './LandingPageModal.css'

function roleHome(role: Role | undefined): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'teacher') return '/teacher/classrooms'
  return '/modules'
}

type AuthMode = 'login' | 'register'

export default function LandingPage() {
  const navigate = useNavigate()
  const { setSession, token, user } = useAuth()
  
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  // Auth Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitLabel = useMemo(() => {
    return authMode === 'login' ? 'Sign In' : 'Create Account'
  }, [authMode])

  // If already logged in, redirect to appropriate dashboard
  if (token && user) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode)
    setError(null)
    setMessage(null)
    setAuthModalOpen(true)
  }

  function closeAuth() {
    setAuthModalOpen(false)
  }

  async function onAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)

    try {
      const safeEmail = email.trim()
      if (!safeEmail) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      if (authMode === 'login') {
        const resp = await loginWithEmail(safeEmail, password)
        setSession(resp)
        navigate(roleHome(resp.user.role), { replace: true })
        return
      }

      if (authMode === 'register' && !name.trim()) {
        throw new Error('Name is required for registration.')
      }

      const resp = await registerWithEmail({
        name: name.trim() || undefined,
        email: safeEmail,
        password,
      })
      setSession(resp)
      navigate(roleHome(resp.user.role), { replace: true })
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
    <div className="landingPage">
      {/* ─── Navbar ─── */}
      <nav className="landingNav">
        <div className="landingNavBrand">
          <img 
            src="/cats logo.png" 
            alt="CATS Logo" 
            style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '8px' }}
          />
          <div className="landingNavTitle">CATS Platform</div>
        </div>
        <div className="landingNavActions">
          <button onClick={() => openAuth('login')} className="landingNavCta">Login / Register</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="landingHero">
        <div className="landingHeroInner">
          <div className="landingBadge">
            <Icon name="workspace_premium" size={16} />
            MinSU Official Training
          </div>
          <h1 className="landingHeroTitle">
            Defend Against <span className="landingHeroTitleAccent">Cyber Threats</span> Before They Happen
          </h1>
          <p className="landingHeroSub">
            Empower yourself with practical cybersecurity skills. Interactive simulations, comprehensive assessments, and real-world scenarios designed for the modern digital landscape.
          </p>
          <div className="landingHeroActions">
            <button onClick={() => openAuth('register')} className="landingCtaPrimary">
              Get Started Now <Icon name="arrow_forward" size={20} />
            </button>
            <a href="#features" className="landingCtaSecondary">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="landingStats">
        <div className="landingStat">
          <div className="landingStatValue">100%</div>
          <div className="landingStatLabel">Free Access</div>
        </div>
        <div className="landingStat">
          <div className="landingStatValue">24/7</div>
          <div className="landingStatLabel">Availability</div>
        </div>
        <div className="landingStat">
          <div className="landingStatValue">Interactive</div>
          <div className="landingStatLabel">Simulations</div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="landingFeatures">
        <div className="landingFeaturesInner">
          <h2 className="landingFeaturesTitle">Everything you need to stay safe</h2>
          <p className="landingFeaturesSub">Comprehensive training modules covering all major threat vectors.</p>
          
          <div className="landingFeaturesGrid">
            <div className="landingFeatureCard">
              <div className="landingFeatureIcon teal">
                <Icon name="phishing" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Phishing Defense</h3>
              <p className="landingFeatureDesc">Learn to identify deceptive emails, malicious links, and social engineering tactics used by cybercriminals.</p>
            </div>
            
            <div className="landingFeatureCard">
              <div className="landingFeatureIcon blue">
                <Icon name="vpn_key" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Password Security</h3>
              <p className="landingFeatureDesc">Master password hygiene, multi-factor authentication, and secure credential management.</p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon purple">
                <Icon name="bug_report" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Malware Protection</h3>
              <p className="landingFeatureDesc">Understand different types of malware, infection vectors, and how to keep your devices secure.</p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon amber">
                <Icon name="admin_panel_settings" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Data Privacy</h3>
              <p className="landingFeatureDesc">Protect sensitive personal and institutional information in accordance with data privacy laws.</p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon red">
                <Icon name="security" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Interactive Scenarios</h3>
              <p className="landingFeatureDesc">Put your skills to the test with real-world cyber attack simulations and interactive decision trees.</p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon indigo">
                <Icon name="emoji_events" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Earn Certificates</h3>
              <p className="landingFeatureDesc">Get rewarded for your learning progress with badges, achievements, and official completion certificates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="landingCta">
        <div className="landingCtaBox">
          <h2 className="landingCtaBoxTitle">Ready to secure your digital life?</h2>
          <p className="landingCtaBoxSub">Join the MinSU Cyber Awareness Training platform today.</p>
          <button onClick={() => openAuth('register')} className="landingCtaBoxBtn">
            Create Free Account <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landingFooter">
        © {new Date().getFullYear()} Mindoro State University (MinSU). All rights reserved. <br/>
        Cyber Awareness Training System
      </footer>

      {/* ─── Auth Modal Overlay ─── */}
      {authModalOpen && (
        <div className="authModalOverlay">
          <div className="authModalBackdrop" onClick={closeAuth} />
          
          <div className="authCard">
            <button className="authModalClose" onClick={closeAuth}>
              <Icon name="close" size={20} />
            </button>

            {/* Brand */}
            <div className="authBrand">
              <img 
                src="/cats logo.png" 
                alt="CATS Logo" 
                style={{ width: 80, height: 80, marginBottom: 12, objectFit: 'contain', borderRadius: '16px' }}
              />
              <h1 className="authBrandTitle">CATS Platform</h1>
              <p className="authBrandSub">Cyber Awareness Training System — MinSU</p>
            </div>

            {/* Tabs */}
            <div className="authTabs" role="tablist" aria-label="Auth mode">
              <button
                className={`authTab ${authMode === 'login' ? 'active' : ''}`}
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                onClick={() => { setAuthMode('login'); setError(null); setMessage(null) }}
              >
                Sign In
              </button>
              <button
                className={`authTab ${authMode === 'register' ? 'active' : ''}`}
                type="button"
                role="tab"
                aria-selected={authMode === 'register'}
                onClick={() => { setAuthMode('register'); setError(null); setMessage(null) }}
              >
                Register
              </button>
            </div>

            {/* Messages */}
            {error && <div className="authError">{error}</div>}
            {message && <div className="authSuccess">{message}</div>}

            {/* Form */}
            <form className="authForm" onSubmit={onAuthSubmit}>
              {authMode === 'register' && (
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
                  placeholder={authMode === 'register' ? 'Create a secure password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  disabled={busy}
                />
              </div>

              <div className="authActions">
                <button className="authSubmitBtn" type="submit" disabled={busy}>
                  {busy ? 'Please wait…' : submitLabel}
                </button>

                {authMode === 'login' && (
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
          </div>
        </div>
      )}
    </div>
  )
}
