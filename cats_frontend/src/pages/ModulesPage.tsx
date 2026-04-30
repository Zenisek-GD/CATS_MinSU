import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import './ModulesPage.css'

type ModuleUiState = {
  status: 'Essential' | 'In Progress' | 'Not Started'
  progressPercent: number
}

function getPlaceholderStateByIndex(idx: number): ModuleUiState {
  if (idx === 0) return { status: 'Essential', progressPercent: 65 }
  if (idx === 1) return { status: 'Not Started', progressPercent: 0 }
  if (idx === 2) return { status: 'In Progress', progressPercent: 25 }
  return { status: 'Not Started', progressPercent: 0 }
}

export default function ModulesPage() {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modules, setModules] = useState<ApiTrainingModule[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!user) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getModules()
        setModules(resp.modules)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load modules.'
        setError(msg)
      } finally {
        setBusy(false)
      }
    })()
  }, [user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return modules
    return modules.filter((m) => {
      const title = (m.title || '').toLowerCase()
      const desc = (m.description || '').toLowerCase()
      return title.includes(q) || desc.includes(q)
    })
  }, [modules, query])

  if (!user) return null

  const overallProgress = 42

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
            <Link className="modulesNavItem active" to="/modules" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <span className="modulesNavItem disabled" aria-disabled="true">
              <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
              <span>Achievements</span>
            </span>
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
                  <div className="modulesTitle">MinSU CyberAware</div>
                  <div className="modulesSubtitle">{user.name || 'Student'}</div>
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
            <section className="modulesHero" aria-label="Overall progress">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Learning Journey</h1>
                  <p className="modulesHeroText">
                    You're making great progress in becoming a cyber-secure student. Keep it up!
                  </p>
                </div>

                <div className="modulesOverall">
                  <div className="modulesOverallRow">
                    <span className="modulesOverallLabel">Overall Progress</span>
                    <span className="modulesOverallValue">{overallProgress}%</span>
                  </div>
                  <div className="modulesOverallBar" role="progressbar" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="modulesOverallBarInner" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>
            </section>

            <div className="modulesSearchRow" aria-label="Search and filter">
              <div className="modulesSearch">
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules..."
                  type="text"
                />
              </div>
              <button type="button" className="modulesFilterBtn" aria-label="Filter topics">
                <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
                <span>All Topics</span>
              </button>
            </div>

            {error ? <div className="modulesError">{error}</div> : null}

            <section className="modulesGrid" aria-label="Learning modules">
              {busy && modules.length === 0 ? (
                <div className="modulesLoading">Loading modules…</div>
              ) : null}

              {filtered.length === 0 && !busy ? (
                <div className="modulesEmpty">No modules found.</div>
              ) : null}

              {filtered.map((m, idx) => {
                const state = getPlaceholderStateByIndex(idx)
                const isFeatured = idx === 0

                if (isFeatured) {
                  return (
                    <article key={m.id} className="moduleCard featured">
                      <div className="moduleMedia">
                        <img
                          alt={m.title}
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKSdz7_qDp2dmg9nVNtVDNHNA2MBpG3fXcCtV3c3hX0HLSuAAn02Fe34EJR50xuILf9VfTsGPxYsvnpPheqV457H27F68u8cJqq557jH42XMeFKDeaHyU4cuv4UMZSNIgLRm43obhFMVjCDI_ONwdMpO9myUsm-rE3ZvsA8GL6NX1tz4Hs-zyyHCRvZuUXH3RIs8p9uOdQTE7A-c3R9Sz4ZBvwLV0utyQjzxjLyoSdCY-WLSe4Ae4zMcbr2qxihNjSUfvexFS9rb9s"
                          loading="lazy"
                        />
                        <div className="moduleMediaOverlay" />
                        <div className="moduleTag">Essential</div>
                      </div>

                      <div className="moduleBody">
                        <div className="moduleHeader">
                          <h2 className="moduleTitle">{m.title}</h2>
                          <span className="moduleStatus">In Progress</span>
                        </div>
                        <p className="moduleDesc">{m.description || '—'}</p>

                        <div className="moduleFooter">
                          <div className="modulePeople" aria-hidden="true">
                            <div className="moduleBubble">JD</div>
                            <div className="moduleBubble teal">MS</div>
                            <div className="moduleBubble">+12</div>
                          </div>

                          <button type="button" className="moduleCta primary">
                            Continue Module
                          </button>
                        </div>

                        <div className="moduleProgress" role="progressbar" aria-valuenow={state.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                          <div className="moduleProgressInner" style={{ width: `${state.progressPercent}%` }} />
                        </div>
                      </div>
                    </article>
                  )
                }

                const icon = idx === 1 ? 'lock_open' : idx === 2 ? 'groups' : idx === 3 ? 'devices' : 'policy'
                const cta = state.progressPercent > 0 ? 'Continue Module' : 'Start Learning'

                return (
                  <article key={m.id} className="moduleCard">
                    <div className="moduleBody compact">
                      <div className="moduleIcon" aria-hidden="true">
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>

                      <h2 className="moduleTitle">{m.title}</h2>
                      <p className="moduleDesc">{m.description || '—'}</p>

                      <div className="moduleMeta">
                        <div className="moduleMetaRow">
                          <span>Progress</span>
                          <span className={state.progressPercent > 0 ? 'inProgress' : 'notStarted'}>
                            {state.progressPercent > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                        <div className="moduleProgress thin" role="progressbar" aria-valuenow={state.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                          <div className="moduleProgressInner" style={{ width: `${state.progressPercent}%` }} />
                        </div>

                        <button type="button" className="moduleCta">
                          {cta}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/modules" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <span className="bottomNavItem" aria-disabled="true">
              <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
              <span>Achievements</span>
            </span>
          </nav>
        </div>
      </div>
    </div>
  )
}
