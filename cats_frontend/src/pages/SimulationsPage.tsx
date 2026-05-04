import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import { getSimulations, startSimulationRun, type ApiSimulation } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'

type SimUi = ApiSimulation & {
  categoryLabel: string
  metaLabel: string
}

function fmtSeconds(seconds: number | null) {
  if (!seconds) return 'No time limit'
  const mins = Math.round(seconds / 60)
  if (mins <= 1) return '1 min'
  return `${mins} mins`
}

export default function SimulationsPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ApiSimulation[]>([])
  const [startingId, setStartingId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getSimulations()
        setItems(resp.simulations)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load simulations.'))
      } finally {
        setBusy(false)
      }
    })()
  }, [user])

  const sims = useMemo<SimUi[]>(() => {
    return items.map((s) => {
      const categoryLabel = s.category?.name || 'General'
      const metaLabel = `${s.difficulty.toUpperCase()} • ${fmtSeconds(s.time_limit_seconds)} • ${s.max_score} max`
      return { ...s, categoryLabel, metaLabel }
    })
  }, [items])

  if (!user) return null

  async function onLogout() {
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

  async function onStart(simId: number) {
    setStartingId(simId)
    setError(null)
    try {
      const resp = await startSimulationRun(simId)
      navigate(`/simulation-runs/${resp.run.id}`)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to start simulation.'))
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img 
              src="/cats logo.png" 
              alt="CATS Logo" 
              className="modulesLogo"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '12px' }}
            />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem active" to="/simulations" aria-current="page">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <Icon name="person" size={20} />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img 
                  src="/cats logo.png" 
                  alt="CATS Logo" 
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }}
                />
                <div>
                  <div className="modulesTitle">Simulations</div>
                  <div className="modulesSubtitle">Practice with realistic scenarios</div>
                </div>
              </div>

              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Simulations hero">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Simulate Real Attacks (Safely)</h1>
                  <p className="modulesHeroText">
                    These are training-only scenarios. Practice your decisions and learn the red flags.
                  </p>
                </div>
              </div>
            </section>

            {error ? <div className="modulesError">{error}</div> : null}

            <section className="modulesGrid" aria-label="Available simulations">
              {busy && items.length === 0 ? <div className="modulesLoading">Loading simulations…</div> : null}
              {sims.length === 0 && !busy ? <div className="modulesEmpty">No simulations available.</div> : null}

              {sims.map((s) => {
                const isStarting = startingId === s.id

                return (
                  <article key={s.id} className="moduleCard">
                    <div className="moduleBody compact">
                      <div className="moduleIcon" aria-hidden="true">
                        <Icon name="security" size={24} />
                      </div>

                      <div className="moduleHeader">
                        <h2 className="moduleTitle">{s.title}</h2>
                        <span className="moduleStatus">{s.categoryLabel}</span>
                      </div>

                      <p className="moduleDesc">{s.description || s.metaLabel}</p>

                      <div className="moduleMeta">
                        <div className="moduleMetaRow">
                          <span>Details</span>
                          <span className="inProgress">{s.metaLabel}</span>
                        </div>

                        <button
                          type="button"
                          className="moduleCta"
                          onClick={() => onStart(s.id)}
                          disabled={!!startingId}
                          aria-disabled={!!startingId}
                        >
                          {isStarting ? 'Starting…' : 'Start Simulation'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem active" to="/simulations" aria-current="page">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
            </Link>
            <Link className="bottomNavItem" to="/profile">
              <Icon name="person" size={20} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
