import { useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { forgotPassword, loginWithEmail, registerWithEmail, type Role } from '../api/auth'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import './LandingPage.css'
import './LandingPageModal.css'

function roleHome(role: Role | undefined): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'teacher') return '/teacher/classrooms'
  return '/modules'
}

type AuthMode = 'login' | 'register'

const THREATS = [
  'Phishing attacks up 58% in 2024',
  'Ransomware targeting schools on the rise',
  'Social engineering is the #1 threat vector',
  'Stay aware. Stay protected.',
  'Credential stuffing hits universities across Southeast Asia',
  'New malware variants bypass traditional antivirus',
  'Zero-day exploits found in popular productivity tools',
  'MFA bypass techniques growing among cybercriminals',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { setSession, token, user } = useAuth()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loginRole, setLoginRole] = useState<'admin' | 'teacher' | 'student' | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher' | null>(null)
  const [teacherCode, setTeacherCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitLabel = useMemo(() => {
    return authMode === 'login' ? 'Sign In' : 'Create Account'
  }, [authMode])

  if (token && user) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode)
    if (mode === 'login') {
      setLoginRole(null)
    }
    setError(null)
    setMessage(null)
    setAuthModalOpen(true)
  }

  function closeAuth() {
    setAuthModalOpen(false)
    setLoginRole(null)
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

      if (authMode === 'register' && !registerRole) {
        throw new Error('Please select a role.')
      }

      if (authMode === 'register' && registerRole === 'teacher' && !teacherCode.trim()) {
        throw new Error('Teacher verification code is required.')
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

  // Duplicate threats for seamless loop
  const tickerItems = [...THREATS, ...THREATS]

  // Floating background icons — cyber/security/tech themed
  const FLOAT_ICONS: { icon: string; size: number; x: number; y: number; delay: number; dur: number; opacity: number }[] = [
    { icon: 'computer',          size: 48, x: 5,  y: 10, delay: 0,    dur: 14, opacity: 0.13 },
    { icon: 'smartphone',        size: 40, x: 90, y: 8,  delay: 2,    dur: 17, opacity: 0.11 },
    { icon: 'lock',              size: 36, x: 18, y: 55, delay: 1,    dur: 12, opacity: 0.14 },
    { icon: 'shield',            size: 52, x: 82, y: 45, delay: 3,    dur: 19, opacity: 0.10 },
    { icon: 'wifi',              size: 34, x: 50, y: 5,  delay: 0.5,  dur: 15, opacity: 0.12 },
    { icon: 'key',               size: 38, x: 70, y: 70, delay: 4,    dur: 13, opacity: 0.13 },
    { icon: 'bug_report',        size: 44, x: 8,  y: 80, delay: 2.5,  dur: 16, opacity: 0.10 },
    { icon: 'phishing',          size: 40, x: 93, y: 75, delay: 1.5,  dur: 18, opacity: 0.11 },
    { icon: 'router',            size: 36, x: 35, y: 85, delay: 3.5,  dur: 14, opacity: 0.12 },
    { icon: 'dns',               size: 42, x: 60, y: 88, delay: 0.8,  dur: 20, opacity: 0.09 },
    { icon: 'vpn_lock',          size: 46, x: 25, y: 25, delay: 2,    dur: 11, opacity: 0.12 },
    { icon: 'security',          size: 38, x: 75, y: 20, delay: 4.5,  dur: 16, opacity: 0.10 },
    { icon: 'fingerprint',       size: 50, x: 45, y: 50, delay: 1.2,  dur: 22, opacity: 0.08 },
    { icon: 'admin_panel_settings', size: 40, x: 12, y: 40, delay: 3, dur: 15, opacity: 0.11 },
    { icon: 'storage',           size: 36, x: 88, y: 55, delay: 0.3,  dur: 13, opacity: 0.13 },
    { icon: 'password',          size: 34, x: 55, y: 30, delay: 5,    dur: 17, opacity: 0.10 },
    { icon: 'desktop_windows',   size: 44, x: 3,  y: 65, delay: 1.8,  dur: 19, opacity: 0.09 },
    { icon: 'webhook',           size: 36, x: 78, y: 88, delay: 2.8,  dur: 14, opacity: 0.11 },
    { icon: 'lan',               size: 40, x: 40, y: 15, delay: 4.2,  dur: 16, opacity: 0.10 },
    { icon: 'monitor_heart',     size: 38, x: 65, y: 60, delay: 0.6,  dur: 18, opacity: 0.09 },
  ]

  return (
    <div className="landingPage">

      {/* ─── Animated Scanning Line ─── */}
      <div className="scanLine" />

      {/* ─── Floating Background Icons ─── */}
      <div className="floatingBg" aria-hidden="true">
        {FLOAT_ICONS.map((f, i) => (
          <span
            key={i}
            className="floatIcon material-symbols-outlined"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: f.size,
              opacity: f.opacity,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.dur}s`,
            }}
          >
            {f.icon}
          </span>
        ))}
      </div>

      {/* ─── Navbar ─── */}
      <nav className="landingNav">
        <div className="landingNavBrand">
          <div className="landingNavLogo">
            <img
              src="/cats logo.png"
              alt="CATS Logo"
              style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: '6px' }}
            />
          </div>
          <div>
            <div className="landingNavTitle">MinSU CyberAware</div>
            <div className="landingNavSub">Mindoro State University</div>
          </div>
        </div>
        <div className="landingNavActions">
          <button
            id="landing-login-btn"
            onClick={() => openAuth('login')}
            className="landingNavBtn landingNavBtnOutline"
          >
            Log in
          </button>
          <button
            id="landing-register-btn"
            onClick={() => {
              setAuthMode('register')
              setRegisterRole(null)
              setError(null)
              setMessage(null)
              setAuthModalOpen(true)
            }}
            className="landingNavBtn landingNavBtnSolid"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="landingHero">
        <div className="landingHeroInner">
          {/* Live badge */}
          <div className="landingBadge">
            <span className="liveDot" />
            Interactive cyber awareness training
          </div>

          {/* Pulsing shield rings */}
          <div className="shieldWrap">
            <div className="shieldRing" />
            <div className="shieldRing" />
            <div className="shieldRing" />
            <div className="shieldCenter">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>shield</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="landingHeroTitle">Be aware.</h1>
          <p className="landingHeroTitle2">Be cyber-safe.</p>

          <p className="landingHeroSub">
            Learn to recognize phishing, malware, and social engineering through
            hands-on simulations and guided modules — built for MinSU students
            and educators.
          </p>

          {/* CTA Buttons */}
          <div className="landingHeroActions">
            <button
              id="hero-login-btn"
              className="landingCtaPrimary"
              onClick={() => openAuth('login')}
            >
              <Icon name="login" size={20} />
              Sign In
            </button>
            <button
              id="hero-register-btn"
              className="landingCtaSecondary"
              onClick={() => openAuth('register')}
            >
              <Icon name="person_add" size={20} />
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="landingStats">
        <div className="landingStat">
          <div className="landingStatValue">2 Roles</div>
          <div className="landingStatLabel">Student · Teacher</div>
        </div>
        <div className="landingStat">
          <div className="landingStatValue">Interactive</div>
          <div className="landingStatLabel">Simulations &amp; Modules</div>
        </div>
        <div className="landingStat">
          <div className="landingStatValue">Private</div>
          <div className="landingStatLabel">MinSU-Only Access</div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="landingFeatures">
        <div className="landingFeaturesInner">
          <h2 className="landingFeaturesTitle">
            Everything you need to <span className="landingFeaturesTitleAccent">stay safe</span>
          </h2>
          <p className="landingFeaturesSub">
            Comprehensive training covering all major cyber threat vectors.
          </p>

          <div className="landingFeaturesGrid">
            <div className="landingFeatureCard">
              <div className="landingFeatureIcon teal">
                <Icon name="phishing" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Phishing Simulations</h3>
              <p className="landingFeatureDesc">
                Practice spotting real phishing attempts in a safe environment.
              </p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon blue">
                <Icon name="menu_book" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Awareness Modules</h3>
              <p className="landingFeatureDesc">
                Structured lessons on malware, online safety, and cyber threats.
              </p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon amber">
                <Icon name="bar_chart" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Classroom Tracking</h3>
              <p className="landingFeatureDesc">
                Teachers assign content and monitor student progress in real time.
              </p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon purple">
                <Icon name="vpn_key" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Password Security</h3>
              <p className="landingFeatureDesc">
                Master password hygiene, MFA, and secure credential management.
              </p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon red">
                <Icon name="bug_report" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Malware Protection</h3>
              <p className="landingFeatureDesc">
                Understand infection vectors and how to keep devices secure.
              </p>
            </div>

            <div className="landingFeatureCard">
              <div className="landingFeatureIcon indigo">
                <Icon name="emoji_events" size={24} />
              </div>
              <h3 className="landingFeatureTitle">Earn Badges</h3>
              <p className="landingFeatureDesc">
                Get rewarded for progress with badges and completion certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="landingCta">
        <div className="landingCtaBox">
          <h2 className="landingCtaBoxTitle">Ready to secure your digital life?</h2>
          <p className="landingCtaBoxSub">Join the MinSU Cyber Awareness Training platform today.</p>
          <button
            id="cta-create-account-btn"
            onClick={() => openAuth('register')}
            className="landingCtaBoxBtn"
          >
            Create Free Account <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landingFooter">
        © {new Date().getFullYear()} Mindoro State University (MinSU). All rights reserved.{' '}
        <br />
        Cyber Awareness Training System (CATS)
      </footer>

      {/* ─── Live Threat Ticker ─── */}
      <div className="threatTicker" role="marquee" aria-label="Live cyber threats feed">
        <div className="tickerLabel">CYBER THREATS</div>
        <div className="tickerTrack">
          <div className="tickerInner">
            {tickerItems.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Auth Modal ─── */}
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

            {/* Show role selector for login mode when no role selected */}
            {authMode === 'login' && !loginRole ? (
              <>
                <h2 style={{ marginTop: 24, marginBottom: 8, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>Who are you?</h2>
                <p style={{ marginBottom: 20, fontSize: 14, color: '#666', textAlign: 'center' }}>Choose your role to sign in.</p>
                <div className="landingRoleCards" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    id="role-student-btn"
                    className="landingRoleCard"
                    onClick={() => setLoginRole('student')}
                    style={{ width: '100%' }}
                  >
                    <span className="landingRoleCardIcon">🎓</span>
                    <span className="landingRoleCardLabel">Student</span>
                    <span className="landingRoleCardDesc">Learn, simulate &amp; assess</span>
                  </button>
                  <button
                    id="role-teacher-btn"
                    className="landingRoleCard"
                    onClick={() => setLoginRole('teacher')}
                    style={{ width: '100%' }}
                  >
                    <span className="landingRoleCardIcon">👩‍🏫</span>
                    <span className="landingRoleCardLabel">Teacher</span>
                    <span className="landingRoleCardDesc">Manage classrooms &amp; content</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div className="authTabs" role="tablist" aria-label="Auth mode">
                  <button
                    className={`authTab ${authMode === 'login' ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'login'}
                    onClick={() => { setAuthMode('login'); setLoginRole(null); setError(null); setMessage(null) }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`authTab ${authMode === 'register' ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'register'}
                    onClick={() => { setAuthMode('register'); setRegisterRole(null); setLoginRole(null); setError(null); setMessage(null) }}
                  >
                    Register
                  </button>
                </div>

                {/* Messages */}
                {error && <div className="authError">{error}</div>}
                {message && <div className="authSuccess">{message}</div>}

                {/* Register role selector */}
                {authMode === 'register' && !registerRole ? (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>Choose your role:</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setRegisterRole('student')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        🎓 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterRole('teacher')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        👩‍🏫 Teacher
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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

              {authMode === 'register' && registerRole === 'teacher' && (
                <div className="authField">
                  <label className="authLabel" htmlFor="auth-teacher-code">Teacher Verification Code</label>
                  <input
                    className="authInput"
                    id="auth-teacher-code"
                    placeholder="Enter your teacher code"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    disabled={busy}
                  />
                  <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Please enter your teacher verification code provided by the admin.</p>
                </div>
              )}

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
              </>
            )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
