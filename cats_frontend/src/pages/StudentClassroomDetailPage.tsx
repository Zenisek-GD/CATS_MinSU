import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { studentClassroomAPI, type Classroom, type ClassroomResource } from '../api/classrooms'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { startQuizAttempt } from '../api/quizzes'
import { startSimulationRun } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'
import './StudentClassroomDetailPage.css'

type Tab = 'modules' | 'quizzes' | 'simulations'

export default function StudentClassroomDetailPage() {
  const { user, clearSession } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [modules, setModules] = useState<ClassroomResource[]>([])
  const [quizzes, setQuizzes] = useState<ClassroomResource[]>([])
  const [simulations, setSimulations] = useState<ClassroomResource[]>([])
  const [globalModules, setGlobalModules] = useState<ApiTrainingModule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('modules')
  const [startingQuizId, setStartingQuizId] = useState<number | null>(null)
  const [startingSimId, setStartingSimId] = useState<number | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return
    load()
  }, [user, id])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const cid = Number(id)
      const [classRes, modsRes, quizRes, simRes, globalModRes] = await Promise.all([
        studentClassroomAPI.getClassroom(cid),
        studentClassroomAPI.getModules(cid),
        studentClassroomAPI.getQuizzes(cid),
        studentClassroomAPI.getSimulations(cid),
        getModules(),
      ])
      setClassroom(classRes.classroom)
      setModules(modsRes.modules)
      setQuizzes(quizRes.quizzes)
      setSimulations(simRes.simulations)
      setGlobalModules(globalModRes.modules)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load classroom.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function getModuleProgress(resource: ClassroomResource) {
    const gm = globalModules.find(m => m.id === resource.id)
    if (!gm) return null
    if (gm.user_progress?.is_completed) return { status: 'Completed' as const, percent: 100 }
    if (!gm.user_progress) return { status: 'Not Started' as const, percent: 0 }
    const totalTopics = gm.topics?.length || 1
    const idx = gm.topics?.findIndex(t => t.id === gm.user_progress?.last_topic_id) ?? -1
    const percent = Math.min(Math.round(((idx + 1) / totalTopics) * 100), 99)
    return { status: 'In Progress' as const, percent }
  }

  const overallModuleProgress = useMemo(() => {
    if (modules.length === 0) return 0
    const completed = modules.filter(m => {
      const gm = globalModules.find(g => g.id === m.id)
      return gm?.user_progress?.is_completed
    }).length
    return Math.round((completed / modules.length) * 100)
  }, [modules, globalModules])

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession() } catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  async function handleStartQuiz(quizId: number) {
    setStartingQuizId(quizId)
    setStartError(null)
    try {
      const resp = await startQuizAttempt(quizId)
      navigate(`/quiz-attempts/${resp.attempt.id}`)
    } catch {
      setStartError('Failed to start quiz. Please try again.')
    } finally {
      setStartingQuizId(null)
    }
  }

  async function handleStartSim(simId: number) {
    setStartingSimId(simId)
    setStartError(null)
    try {
      const resp = await startSimulationRun(simId)
      navigate(`/simulation-runs/${resp.run.id}`)
    } catch {
      setStartError('Failed to start simulation. Please try again.')
    } finally {
      setStartingSimId(null)
    }
  }

  if (!user) return null

  const tabCounts = { modules: modules.length, quizzes: quizzes.length, simulations: simulations.length }

  return (
    <div className="modulesPage">
      <div className="modulesShell">

        {/* ── Sidebar ── */}
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img src="/cats logo.png" alt="CATS Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12 }} />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="modulesNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="modulesNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="modulesNavItem active" to="/classrooms" aria-current="page"><Icon name="groups" size={20} /><span>Classrooms</span></Link>
            <Link className="modulesNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link className="modulesNavItem" to="/teacher/classrooms"><Icon name="manage_accounts" size={20} /><span>Teacher</span></Link>
            )}
          </nav>
          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} /><span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <button className="scdBackBtn" onClick={() => navigate('/classrooms')} aria-label="Back to classrooms">
                  <Icon name="arrow_back" size={20} />
                </button>
                <div>
                  <div className="modulesTitle">{loading ? 'Loading…' : (classroom?.name ?? 'Classroom')}</div>
                  <div className="modulesSubtitle">
                    {classroom?.teacher ? `by ${classroom.teacher.name}` : user.name}
                  </div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {error ? (
              <div className="scdError">
                <Icon name="error" size={32} />
                <p>{error}</p>
                <button className="scdRetryBtn" onClick={load}>Try again</button>
              </div>
            ) : loading ? (
              <div className="scdSkeleton">
                <div className="scdSkeletonHero" />
                <div className="scdSkeletonTabs" />
                <div className="scdSkeletonList">
                  {[1, 2, 3].map(i => <div key={i} className="scdSkeletonCard" />)}
                </div>
              </div>
            ) : classroom ? (
              <>
                {/* ── Hero Banner ── */}
                <section className="scdHero">
                  <div className="scdHeroInner">
                    <div className="scdHeroLeft">
                      <div className="scdHeroAvatar">{classroom.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <h1 className="scdHeroTitle">{classroom.name}</h1>
                        {classroom.description && (
                          <p className="scdHeroDesc">{classroom.description}</p>
                        )}
                        <div className="scdHeroMeta">
                          {classroom.teacher && (
                            <span className="scdHeroMetaItem">
                              <Icon name="person" size={14} /> {classroom.teacher.name}
                            </span>
                          )}
                          <span className="scdHeroMetaItem">
                            <Icon name="vpn_key" size={14} /> {classroom.code}
                          </span>
                          <span className={`scdHeroStatus ${classroom.status}`}>{classroom.status}</span>
                        </div>
                      </div>
                    </div>

                    {modules.length > 0 && (
                      <div className="scdHeroProgress">
                        <div className="scdHeroProgressLabel">
                          <span>Module Progress</span>
                          <span className="scdHeroProgressPct">{overallModuleProgress}%</span>
                        </div>
                        <div className="scdHeroProgressBar">
                          <div className="scdHeroProgressFill" style={{ width: `${overallModuleProgress}%` }} />
                        </div>
                        <div className="scdHeroProgressSub">
                          {modules.filter(m => globalModules.find(g => g.id === m.id)?.user_progress?.is_completed).length}
                          /{modules.length} modules completed
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Stats row ── */}
                <div className="scdStats">
                  <div className="scdStat">
                    <Icon name="menu_book" size={18} />
                    <span className="scdStatVal">{modules.length}</span>
                    <span className="scdStatLabel">Modules</span>
                  </div>
                  <div className="scdStat">
                    <Icon name="quiz" size={18} />
                    <span className="scdStatVal">{quizzes.length}</span>
                    <span className="scdStatLabel">Quizzes</span>
                  </div>
                  <div className="scdStat">
                    <Icon name="security" size={18} />
                    <span className="scdStatVal">{simulations.length}</span>
                    <span className="scdStatLabel">Simulations</span>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className="scdTabs" role="tablist">
                  {(['modules', 'quizzes', 'simulations'] as Tab[]).map(tab => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={activeTab === tab}
                      className={`scdTab ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                      id={`tab-${tab}`}
                    >
                      {tab === 'modules' && <Icon name="menu_book" size={16} />}
                      {tab === 'quizzes' && <Icon name="quiz" size={16} />}
                      {tab === 'simulations' && <Icon name="security" size={16} />}
                      <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                      {tabCounts[tab] > 0 && (
                        <span className="scdTabBadge">{tabCounts[tab]}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Tab content: Modules ── */}
                {activeTab === 'modules' && (
                  <div className="scdList" role="tabpanel" aria-labelledby="tab-modules">
                    {modules.length === 0 ? (
                      <EmptyTab icon="menu_book" text="No modules assigned yet." hint="Your teacher hasn't added any modules to this classroom." />
                    ) : modules.map(m => {
                      const prog = getModuleProgress(m)
                      return (
                        <article key={m.id} className="scdCard" id={`mod-${m.id}`}>
                          <div className="scdCardIcon mod">
                            <Icon name="menu_book" size={20} />
                          </div>
                          <div className="scdCardBody">
                            <div className="scdCardTop">
                              <div>
                                <h3 className="scdCardTitle">{m.title}</h3>
                                {m.description && <p className="scdCardDesc">{m.description}</p>}
                              </div>
                              <div className="scdCardBadges">
                                {m.pivot.due_date && (
                                  <span className={`scdDueBadge ${new Date(m.pivot.due_date) < new Date() ? 'overdue' : ''}`}>
                                    <Icon name="schedule" size={12} />
                                    Due {new Date(m.pivot.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                {prog && (
                                  <span className={`scdProgressBadge ${prog.status === 'Completed' ? 'done' : prog.status === 'In Progress' ? 'inprogress' : ''}`}>
                                    {prog.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            {prog && (
                              <div className="scdMiniProgress">
                                <div className="scdMiniProgressBar">
                                  <div className="scdMiniProgressFill" style={{ width: `${prog.percent}%` }} />
                                </div>
                                <span className="scdMiniProgressPct">{prog.percent}%</span>
                              </div>
                            )}
                          </div>
                          <Link to={`/modules/${m.id}`} className="scdCardCta" aria-label={`Open module: ${m.title}`}>
                            {prog?.status === 'Completed' ? 'Review' : prog?.status === 'In Progress' ? 'Continue' : 'Start'}
                            <Icon name="chevron_right" size={18} />
                          </Link>
                        </article>
                      )
                    })}
                  </div>
                )}

                {/* ── Tab content: Quizzes ── */}
                {activeTab === 'quizzes' && (
                  <div className="scdList" role="tabpanel" aria-labelledby="tab-quizzes">
                    {startError && (
                      <div className="scdStartError">
                        <Icon name="error" size={16} /> {startError}
                      </div>
                    )}
                    {quizzes.length === 0 ? (
                      <EmptyTab icon="quiz" text="No quizzes assigned yet." hint="Your teacher will assign quizzes to this classroom soon." />
                    ) : quizzes.map(q => {
                      const isCompleted = q.pivot.is_completed === true
                      const isStarting = startingQuizId === q.id
                      const isDisabled = isCompleted || !q.pivot.is_active || !!startingQuizId
                      return (
                        <article key={q.id} className="scdCard" id={`quiz-${q.id}`}>
                          <div className="scdCardIcon quiz">
                            <Icon name="quiz" size={20} />
                          </div>
                          <div className="scdCardBody">
                            <div className="scdCardTop">
                              <div>
                                <h3 className="scdCardTitle">{q.title}</h3>
                                {q.description && <p className="scdCardDesc">{q.description}</p>}
                              </div>
                              <div className="scdCardBadges">
                                {isCompleted && (
                                  <span className="scdProgressBadge done">
                                    <Icon name="check_circle" size={12} />
                                    {' '}Done{q.pivot.score != null ? ` · ${q.pivot.score}%` : ''}
                                  </span>
                                )}
                                {q.pivot.due_date && (
                                  <span className={`scdDueBadge ${new Date(q.pivot.due_date) < new Date() ? 'overdue' : ''}`}>
                                    <Icon name="schedule" size={12} />
                                    Due {new Date(q.pivot.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                {!q.pivot.is_active && (
                                  <span className="scdProgressBadge">Inactive</span>
                                )}
                              </div>
                            </div>
                            {q.pivot.time_limit_seconds && !isCompleted && (
                              <div className="scdTimerNote">
                                <Icon name="timer" size={13} />
                                {Math.round(q.pivot.time_limit_seconds / 60)} min time limit
                              </div>
                            )}
                          </div>
                          <button
                            className={`scdCardCta${isCompleted ? ' scdCardCtaDone' : ''}`}
                            onClick={() => !isCompleted && handleStartQuiz(q.id)}
                            disabled={isDisabled}
                            aria-label={isCompleted ? `Quiz completed: ${q.title}` : `Start quiz: ${q.title}`}
                          >
                            {isCompleted ? (
                              <><Icon name="check_circle" size={16} /> Completed</>
                            ) : isStarting ? 'Starting…' : (
                              <>Take Quiz <Icon name="chevron_right" size={18} /></>
                            )}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                )}

                {/* ── Tab content: Simulations ── */}
                {activeTab === 'simulations' && (
                  <div className="scdList" role="tabpanel" aria-labelledby="tab-simulations">
                    {startError && (
                      <div className="scdStartError">
                        <Icon name="error" size={16} /> {startError}
                      </div>
                    )}
                    {simulations.length === 0 ? (
                      <EmptyTab icon="security" text="No simulations assigned yet." hint="Your teacher will assign simulations to this classroom soon." />
                    ) : simulations.map(s => {
                      const isCompleted = s.pivot.is_completed === true
                      const isStarting = startingSimId === s.id
                      const isDisabled = isCompleted || !s.pivot.is_active || !!startingSimId
                      return (
                        <article key={s.id} className="scdCard" id={`sim-${s.id}`}>
                          <div className="scdCardIcon sim">
                            <Icon name="security" size={20} />
                          </div>
                          <div className="scdCardBody">
                            <div className="scdCardTop">
                              <div>
                                <h3 className="scdCardTitle">{s.title}</h3>
                                {s.description && <p className="scdCardDesc">{s.description}</p>}
                              </div>
                              <div className="scdCardBadges">
                                {isCompleted && (
                                  <span className="scdProgressBadge done">
                                    <Icon name="check_circle" size={12} />
                                    {' '}Done{s.pivot.score != null ? ` · ${s.pivot.score}%` : ''}
                                  </span>
                                )}
                                {s.pivot.due_date && (
                                  <span className={`scdDueBadge ${new Date(s.pivot.due_date) < new Date() ? 'overdue' : ''}`}>
                                    <Icon name="schedule" size={12} />
                                    Due {new Date(s.pivot.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                {!s.pivot.is_active && (
                                  <span className="scdProgressBadge">Inactive</span>
                                )}
                              </div>
                            </div>
                            {s.pivot.time_limit_seconds && !isCompleted && (
                              <div className="scdTimerNote">
                                <Icon name="timer" size={13} />
                                {Math.round(s.pivot.time_limit_seconds / 60)} min time limit
                              </div>
                            )}
                          </div>
                          <button
                            className={`scdCardCta${isCompleted ? ' scdCardCtaDone' : ''}`}
                            onClick={() => !isCompleted && handleStartSim(s.id)}
                            disabled={isDisabled}
                            aria-label={isCompleted ? `Simulation completed: ${s.title}` : `Start simulation: ${s.title}`}
                          >
                            {isCompleted ? (
                              <><Icon name="check_circle" size={16} /> Completed</>
                            ) : isStarting ? 'Starting…' : (
                              <>Practice <Icon name="chevron_right" size={18} /></>
                            )}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            ) : null}
          </main>

          {/* Bottom nav */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="bottomNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="bottomNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="bottomNavItem active" to="/classrooms" aria-current="page"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

function EmptyTab({ icon, text, hint }: { icon: string; text: string; hint: string }) {
  return (
    <div className="scdEmpty">
      <Icon name={icon} size={40} />
      <p className="scdEmptyText">{text}</p>
      <p className="scdEmptyHint">{hint}</p>
    </div>
  )
}
