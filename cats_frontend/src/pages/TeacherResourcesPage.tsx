import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { teacherClassroomAPI, type Classroom } from '../api/classrooms'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { getQuizzes, type ApiQuiz } from '../api/quizzes'
import { getSimulations, type ApiSimulation } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'

type ResourceType = 'module' | 'quiz' | 'simulation'

export default function TeacherResourcesPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [resourceType, setResourceType] = useState<ResourceType>('module')
  const [modules, setModules] = useState<ApiTrainingModule[]>([])
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([])
  const [simulations, setSimulations] = useState<ApiSimulation[]>([])
  const [loadingResources, setLoadingResources] = useState(false)

  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState<string>('')
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (!user) return
    load()
    loadResources()
  }, [user])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await teacherClassroomAPI.getClassrooms()
      const active = data.classrooms.filter(c => c.status === 'active')
      setClassrooms(active)
      setSelectedClassroomIds(active.map(c => c.id))
    } catch {
      setError('Failed to load classrooms.')
      setClassrooms([])
      setSelectedClassroomIds([])
    } finally {
      setLoading(false)
    }
  }

  async function loadResources() {
    setLoadingResources(true)
    try {
      const [m, q, s] = await Promise.all([getModules(), getQuizzes(), getSimulations()])
      setModules(m.modules)
      setQuizzes(q.quizzes)
      setSimulations(s.simulations)

      // pick a default if not set
      const defaultId =
        m.modules[0]?.id ?? q.quizzes[0]?.id ?? s.simulations[0]?.id ?? null
      setSelectedResourceId(defaultId)
    } catch {
      // ignore; user can still open classroom detail pages to assign
    } finally {
      setLoadingResources(false)
    }
  }

  const resourceOptions = useMemo(() => {
    if (resourceType === 'module') return modules.map(m => ({ id: m.id, title: m.title }))
    if (resourceType === 'quiz') return quizzes.map(q => ({ id: q.id, title: q.title }))
    return simulations.map(s => ({ id: s.id, title: s.title }))
  }, [resourceType, modules, quizzes, simulations])

  useEffect(() => {
    // When switching type, reset selection to first option
    if (resourceType === 'module') setSelectedResourceId(modules[0]?.id ?? null)
    else if (resourceType === 'quiz') setSelectedResourceId(quizzes[0]?.id ?? null)
    else setSelectedResourceId(simulations[0]?.id ?? null)
  }, [resourceType])

  function toggleClassroom(id: number) {
    setSelectedClassroomIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  async function bulkAssign() {
    if (!selectedResourceId) {
      alert('Select a resource.')
      return
    }
    if (selectedClassroomIds.length === 0) {
      alert('Select at least one classroom.')
      return
    }

    setAssigning(true)
    let success = 0

    try {
      for (const classroomId of selectedClassroomIds) {
        try {
          if (resourceType === 'module') {
            await teacherClassroomAPI.assignModule(classroomId, {
              module_id: selectedResourceId,
              due_date: dueDate || undefined,
            })
          } else if (resourceType === 'quiz') {
            await teacherClassroomAPI.assignQuiz(classroomId, {
              quiz_id: selectedResourceId,
              due_date: dueDate || undefined,
            })
          } else {
            await teacherClassroomAPI.assignSimulation(classroomId, {
              simulation_id: selectedResourceId,
              due_date: dueDate || undefined,
            })
          }
          success++
        } catch {
          // keep going
        }
      }

      alert(`Assigned to ${success}/${selectedClassroomIds.length} classroom(s).`)
    } finally {
      setAssigning(false)
    }
  }

  async function onLogout() {
    setLoggingOut(true)
    try {
      await clearSession()
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user) return null

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        {/* ── Sidebar ── */}
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img
              src="/cats logo.png"
              alt="CATS Logo"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12 }}
            />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/teacher/classrooms">
              <Icon name="school" size={20} />
              <span>Classrooms</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} />
              <span>Reports</span>
            </Link>
            <Link className="modulesNavItem active" to="/teacher/resources" aria-current="page">
              <Icon name="video_library" size={20} /><span>Resources</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/feedback">
              <Icon name="feedback" size={20} /><span>Feedback</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <Icon name="person" size={20} /><span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button
              type="button"
              className="sidebarLogoutBtn"
              onClick={onLogout}
              disabled={loggingOut}
            >
              <Icon name="logout" size={20} />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img
                  src="/cats logo.png"
                  alt="CATS Logo"
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12 }}
                />
                <div>
                  <div className="modulesTitle">Resources</div>
                  <div className="modulesSubtitle">{user.name || 'Teacher'}</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero">
              <div className="modulesHeroInner" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h1 className="modulesHeroTitle">Bulk Assign</h1>
                  <p className="modulesHeroText">Assign a module, quiz, or simulation to multiple classrooms.</p>

                  <div className="tcField" style={{ marginTop: 10 }}>
                    <label>Resource Type</label>
                    <select
                      value={resourceType}
                      onChange={e => setResourceType(e.target.value as ResourceType)}
                      disabled={loadingResources}
                    >
                      <option value="module">Module</option>
                      <option value="quiz">Quiz</option>
                      <option value="simulation">Simulation</option>
                    </select>
                  </div>

                  <div className="tcField" style={{ marginTop: 10 }}>
                    <label>Resource</label>
                    <select
                      value={selectedResourceId ?? ''}
                      onChange={e => setSelectedResourceId(e.target.value ? Number(e.target.value) : null)}
                      disabled={loadingResources || resourceOptions.length === 0}
                    >
                      <option value="">— Select —</option>
                      {resourceOptions.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tcField" style={{ marginTop: 10 }}>
                    <label>Due Date (optional)</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>

                  <div className="tcHeroActions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 10 }}>
                    <button
                      className="tcHeroBtn"
                      onClick={bulkAssign}
                      disabled={assigning || loading || loadingResources}
                    >
                      <Icon name="done_all" size={16} />
                      {assigning ? 'Assigning…' : 'Assign to Selected Classrooms'}
                    </button>
                    <button className="tcHeroBtn" onClick={() => navigate('/teacher/classrooms')}>
                      <Icon name="school" size={16} /> Open Classrooms
                    </button>
                  </div>
                </div>

                <div className="teacherStats" aria-label="Classroom counts">
                  <div className="teacherStat">
                    <span className="teacherStatVal">{classrooms.length}</span>
                    <span className="teacherStatLabel">Active Classes</span>
                  </div>
                  <div className="teacherStat">
                    <span className="teacherStatVal">{selectedClassroomIds.length}</span>
                    <span className="teacherStatLabel">Selected</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="teacherActionBar" style={{ marginTop: '1rem' }}>
              <h2 className="teacherSectionTitle">Select Classrooms</h2>
              <button
                className="moduleCta"
                onClick={() => setSelectedClassroomIds(classrooms.map(c => c.id))}
                disabled={loading}
              >
                <Icon name="check_circle_outline" size={18} /> Select All
              </button>
              <button
                className="moduleCta"
                onClick={() => setSelectedClassroomIds([])}
                disabled={loading}
              >
                <Icon name="cancel" size={18} /> Clear
              </button>
            </div>

            {error && <div className="modulesError">{error}</div>}

            {loading ? (
              <div className="modulesLoading">Loading classrooms…</div>
            ) : classrooms.length === 0 ? (
              <div className="teacherEmpty">
                <Icon name="school" size={48} />
                <p>No active classrooms found.</p>
                <button className="moduleCta primary" onClick={() => navigate('/teacher/classrooms')}>
                  <Icon name="arrow_forward" size={18} /> Go to Classrooms
                </button>
              </div>
            ) : (
              <div className="tcList" style={{ marginTop: 10 }}>
                {classrooms.map(c => {
                  const checked = selectedClassroomIds.includes(c.id)
                  return (
                    <div key={c.id} className="tcListRow" style={{ alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClassroom(c.id)}
                          aria-label={`Select ${c.name}`}
                        />
                        <div className="tcListMain">
                          <div className="tcListTitle">{c.name}</div>
                          <div className="tcListMeta">Code: {c.code} · {c.students_count ?? 0} students</div>
                        </div>
                      </div>
                      <button
                        className="moduleCta"
                        onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                      >
                        View
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/teacher/classrooms">
              <Icon name="school" size={20} />
              <span>Classes</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} />
              <span>Reports</span>
            </Link>
            <Link className="bottomNavItem active" to="/teacher/resources" aria-current="page"><Icon name="video_library" size={20} /><span>Resources</span></Link>
            <Link className="bottomNavItem" to="/teacher/feedback"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
