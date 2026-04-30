import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import { getSimulations, startSimulationRun, type ApiSimulation } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
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
  const { user } = useAuth()
  const navigate = useNavigate()

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
            <div className="modulesAvatar" aria-hidden="true">
              {user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem active" to="/simulations" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <div className="modulesAvatar lg" aria-hidden="true">
                  {user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="modulesTitle">Simulations</div>
                  <div className="modulesSubtitle">Practice with realistic scenarios</div>
                </div>
              </div>

              <button type="button" className="modulesIconBtn" aria-label="Notifications">
                <span className="material-symbols-outlined" aria-hidden="true">
                  notifications
                </span>
              </button>
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
                        <span className="material-symbols-outlined">security</span>
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
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem active" to="/simulations" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="bottomNavItem" to="/profile">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
