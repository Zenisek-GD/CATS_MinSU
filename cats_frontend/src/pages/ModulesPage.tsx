import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'

type ModuleUiState = {
  status: 'Essential' | 'In Progress' | 'Not Started' | 'Completed'
  progressPercent: number
}

function getModuleState(module: ApiTrainingModule): ModuleUiState {
  const progress = module.user_progress
  
  if (!progress) {
    // Not started
    return { status: 'Not Started', progressPercent: 0 }
  }
  
  if (progress.is_completed) {
    // Completed
    return { status: 'Completed', progressPercent: 100 }
  }
  
  // In progress - estimate based on last_topic_id and total topics
  const totalTopics = module.topics?.length || 1
  const completedTopicIndex = module.topics?.findIndex(t => t.id === progress.last_topic_id) ?? -1
  const progressPercent = Math.min(Math.round(((completedTopicIndex + 1) / totalTopics) * 100), 99)
  
  return { status: 'In Progress', progressPercent }
}

function getOverallProgress(modules: ApiTrainingModule[]): number {
  if (modules.length === 0) return 0
  const totalTopics = modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0)
  if (totalTopics === 0) return 0
  
  const completedTopics = modules.reduce((sum, m) => {
    if (!m.user_progress) return sum
    if (m.user_progress.is_completed) {
      return sum + (m.topics?.length || 0)
    }
    const topicIndex = m.topics?.findIndex(t => t.id === m.user_progress?.last_topic_id) ?? -1
    return sum + (topicIndex + 1)
  }, 0)
  
  return Math.round((completedTopics / totalTopics) * 100)
}

export default function ModulesPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
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

  const overallProgress = getOverallProgress(filtered)

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
            <Link className="modulesNavItem active" to="/modules" aria-current="page">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
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
            {user.role === 'admin' && (
              <Link className="modulesNavItem" to="/admin/dashboard">
                <Icon name="admin_panel_settings" size={20} />
                <span>Admin</span>
              </Link>
            )}
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
                  <div className="modulesTitle">MinSU CyberAware</div>
                  <div className="modulesSubtitle">{user.name || 'Student'}</div>
                </div>
              </div>

              <TopbarActions hideLogout />
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
                <Icon name="search" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules..."
                  type="text"
                />
              </div>
              <button type="button" className="modulesFilterBtn" aria-label="Filter topics">
                <Icon name="filter_list" size={20} />
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
                const state = getModuleState(m)
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
                        <div className="moduleTag">{state.status === 'Completed' ? 'Completed' : 'Featured'}</div>
                      </div>

                      <div className="moduleBody">
                        <div className="moduleHeader">
                          <h2 className="moduleTitle">{m.title}</h2>
                          <span className="moduleStatus">{state.status}</span>
                        </div>
                        <p className="moduleDesc">{m.description || '—'}</p>

                        <div className="moduleFooter">
                          <div className="modulePeople" aria-hidden="true">
                            <div className="moduleBubble">JD</div>
                            <div className="moduleBubble teal">MS</div>
                            <div className="moduleBubble">+12</div>
                          </div>

                          <Link to={`/modules/${m.id}`} className="moduleCta primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {state.status === 'Completed' ? 'Review Module' : 'Continue Module'}
                          </Link>
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
                        <Icon name={icon} size={24} />
                      </div>

                      <h2 className="moduleTitle">{m.title}</h2>
                      <p className="moduleDesc">{m.description || '—'}</p>

                      <div className="moduleMeta">
                        <div className="moduleMetaRow">
                          <span>Progress</span>
                          <span className={state.status === 'Completed' ? 'completed' : state.progressPercent > 0 ? 'inProgress' : 'notStarted'}>
                            {state.status}
                          </span>
                        </div>
                        <div className="moduleProgress thin" role="progressbar" aria-valuenow={state.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                          <div className="moduleProgressInner" style={{ width: `${state.progressPercent}%` }} />
                        </div>

                        <Link to={`/modules/${m.id}`} className="moduleCta" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {cta}
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/modules" aria-current="page">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
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
