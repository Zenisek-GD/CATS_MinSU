import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { teacherClassroomAPI, teacherReportsAPI, type Classroom, type ClassroomStudent, type ClassroomResource, type QRCodeData, type TeacherClassroomReport } from '../api/classrooms'
import { getQuizzes, type ApiQuiz } from '../api/quizzes'
import { getSimulations, type ApiSimulation } from '../api/simulations'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'
import './TeacherClassroomDetailPage.css'

type Tab = 'students' | 'quizzes' | 'simulations' | 'modules' | 'analytics'

export default function TeacherClassroomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<ClassroomStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('students')

  const [report, setReport] = useState<TeacherClassroomReport | null>(null)
  const [reportLoading, setReportLoading] = useState(false)

  // Resources
  const [assignedQuizzes, setAssignedQuizzes] = useState<ClassroomResource[]>([])
  const [assignedSims, setAssignedSims] = useState<ClassroomResource[]>([])
  const [assignedModules, setAssignedModules] = useState<ClassroomResource[]>([])
  const [allQuizzes, setAllQuizzes] = useState<ApiQuiz[]>([])
  const [allSims, setAllSims] = useState<ApiSimulation[]>([])
  const [allModules, setAllModules] = useState<ApiTrainingModule[]>([])

  // Modals
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [showAssign, setShowAssign] = useState<Tab | null>(null)
  const [assignId, setAssignId] = useState('')
  const [assignDue, setAssignDue] = useState('')
  const [assignTimeLimit, setAssignTimeLimit] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Edit
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)
  // UI
  const [codeCopied, setCodeCopied] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !id) return
    loadAll()
    loadResources()
  }, [user, id])

  useEffect(() => {
    if (!user || !id) return
    if (tab !== 'analytics') return
    if (report) return
    loadReport()
  }, [tab, user, id])

  useEffect(() => {
    if (!overflowOpen) return
    function onOut(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setOverflowOpen(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [overflowOpen])

  function copyCode() {
    navigator.clipboard.writeText(classroom?.code ?? '')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [cr, st] = await Promise.all([
        teacherClassroomAPI.getClassroom(Number(id)),
        teacherClassroomAPI.getStudents(Number(id)),
      ])
      setClassroom(cr.classroom)
      setStudents(st.students)
      setEditName(cr.classroom.name)
      setEditDesc(cr.classroom.description ?? '')
      setAssignedQuizzes(cr.classroom.quizzes ?? [])
      setAssignedSims(cr.classroom.simulations ?? [])
      setAssignedModules(cr.classroom.modules ?? [])
      loadReport()
    } catch {
      alert('Failed to load classroom.')
      navigate('/teacher/classrooms')
    } finally {
      setLoading(false)
    }
  }

  async function loadResources() {
    try {
      const [q, s, m] = await Promise.all([getQuizzes(), getSimulations(), getModules()])
      setAllQuizzes(q.quizzes)
      setAllSims(s.simulations)
      setAllModules(m.modules)
    } catch { /* ignore */ }
  }

  async function loadReport() {
    if (!id) return
    setReportLoading(true)
    try {
      const data = await teacherReportsAPI.getClassroom(Number(id))
      setReport(data)
    } catch {
      setReport(null)
    } finally {
      setReportLoading(false)
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function downloadClassCsv() {
    if (!classroom) return
    try {
      const blob = await teacherReportsAPI.downloadClassroomCsv(classroom.id)
      downloadBlob(blob, `classroom-${classroom.id}-report.csv`)
    } catch {
      alert('Failed to download report.')
    }
  }

  function printClassPdf() {
    if (!report) {
      alert('Report not loaded yet.')
      return
    }
    const html = buildClassroomPrintHtml(report)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  async function handleSaveEdit() {
    if (!classroom) return
    setSaving(true)
    try {
      await teacherClassroomAPI.updateClassroom(classroom.id, { name: editName, description: editDesc })
      setClassroom(c => c ? { ...c, name: editName, description: editDesc } : c)
      setEditing(false)
    } catch { alert('Failed to save.') }
    finally { setSaving(false) }
  }

  async function handleArchive() {
    if (!classroom || !confirm('Archive this classroom?')) return
    try {
      await teacherClassroomAPI.updateClassroom(classroom.id, { status: 'archived' })
      navigate('/teacher/classrooms')
    } catch { alert('Failed to archive.') }
  }

  async function handleGetQR() {
    if (!classroom) return
    try {
      const data = await teacherClassroomAPI.getQRCode(classroom.id)
      setQrData(data)
      setShowQR(true)
    } catch { alert('Failed to load QR code.') }
  }

  async function handleRegenCode() {
    if (!classroom || !confirm('Regenerate the classroom code? The old code will stop working.')) return
    try {
      const data = await teacherClassroomAPI.regenerateCode(classroom.id)
      setClassroom(data.classroom)
      setQrData(null)
    } catch { alert('Failed to regenerate code.') }
  }

  async function handleRemoveStudent(studentId: number) {
    if (!classroom || !confirm('Remove this student?')) return
    try {
      await teacherClassroomAPI.removeStudent(classroom.id, studentId)
      setStudents(s => s.filter(x => x.id !== studentId))
    } catch { alert('Failed to remove student.') }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!classroom || !assignId) return
    setAssigning(true)
    try {
      const due = assignDue || undefined
      const timeLimitSecs = assignTimeLimit ? Number(assignTimeLimit) * 60 : undefined
      if (showAssign === 'quizzes') {
        await teacherClassroomAPI.assignQuiz(classroom.id, { quiz_id: Number(assignId), due_date: due, time_limit_seconds: timeLimitSecs })
      } else if (showAssign === 'simulations') {
        await teacherClassroomAPI.assignSimulation(classroom.id, { simulation_id: Number(assignId), due_date: due, time_limit_seconds: timeLimitSecs })
      } else if (showAssign === 'modules') {
        await teacherClassroomAPI.assignModule(classroom.id, { module_id: Number(assignId), due_date: due })
      }
      setShowAssign(null)
      setAssignId('')
      setAssignDue('')
      setAssignTimeLimit('')
      loadAll()
    } catch { alert('Failed to assign resource.') }
    finally { setAssigning(false) }
  }

  async function handleRemoveResource(resourceId: number, type: Tab) {
    if (!classroom || !confirm('Remove this assignment?')) return
    try {
      if (type === 'quizzes') await teacherClassroomAPI.removeQuiz(classroom.id, resourceId)
      else if (type === 'simulations') await teacherClassroomAPI.removeSimulation(classroom.id, resourceId)
      else if (type === 'modules') await teacherClassroomAPI.removeModule(classroom.id, resourceId)
      loadAll()
    } catch { alert('Failed to remove.') }
  }

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession() } catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  if (!user) return null
  if (loading) return <div className="modulesPage"><div className="modulesLoading" style={{ padding: '4rem', textAlign: 'center' }}>Loading classroom…</div></div>
  if (!classroom) return null

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

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
            <Link className="modulesNavItem active" to="/teacher/classrooms" aria-current="page">
              <Icon name="school" size={20} /><span>Classrooms</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} /><span>Reports</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/resources">
              <Icon name="library_books" size={20} /><span>Resources</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <Icon name="person" size={20} /><span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
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
                <button className="tcBackBtn" onClick={() => navigate('/teacher/classrooms')} aria-label="Back">
                  <Icon name="arrow_back" size={20} />
                </button>
                <div>
                  <div className="modulesTitle">{classroom.name}</div>
                  <div className="modulesSubtitle">Classroom · {classroom.code}</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* Slim banner */}
            <section className="tcSlimHero">
              <div className="tcSlimHeroRow">
                <div className="tcSlimHeroInfo">
                  {editing ? (
                    <div className="tcEditForm">
                      <input className="tcEditInput" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" autoFocus />
                      <textarea className="tcEditTextarea" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" rows={1} />
                      <button className="moduleCta primary" onClick={handleSaveEdit} disabled={saving} style={{ flexShrink: 0 }}>{saving ? 'Saving…' : 'Save'}</button>
                      <button className="moduleCta" onClick={() => setEditing(false)} style={{ flexShrink: 0 }}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <p className="tcSlimHeroTitle">{classroom.name}</p>
                      <p className="tcSlimHeroDesc">{classroom.description || 'No description'}</p>
                    </>
                  )}
                </div>
                <div className="tcCodeBadge">
                  <span className="tcCodeLabel">Code</span>
                  <span className="tcCodeValue">{classroom.code}</span>
                  <button className="tcCodeCopy" onClick={copyCode} aria-label="Copy code">
                    <Icon name={codeCopied ? 'check' : 'content_copy'} size={16} />
                    {codeCopied && <span className="tcCopiedTip">Copied!</span>}
                  </button>
                </div>
                <div className="tcHeroActions">
                  <button className="tcHeroBtn" onClick={handleGetQR}><Icon name="qr_code" size={16} /> QR Code</button>
                  <button className="tcHeroBtn" onClick={() => setEditing(true)}><Icon name="edit" size={16} /> Edit</button>
                  <button className="tcHeroBtn" onClick={handleRegenCode}><Icon name="refresh" size={16} /> New Code</button>
                  <div className="tcOverflowWrap" ref={overflowRef}>
                    <button className="tcOverflowBtn" onClick={() => setOverflowOpen(o => !o)} aria-label="More options" aria-expanded={overflowOpen}>
                      <Icon name="more_vert" size={20} />
                    </button>
                    {overflowOpen && (
                      <div className="tcOverflowMenu" role="menu">
                        <button role="menuitem" className="tcOverflowItem danger" onClick={() => { setOverflowOpen(false); handleArchive() }}>
                          <Icon name="archive" size={16} /> Archive Classroom
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <div className="tcTabs" role="tablist">
              {(['students', 'quizzes', 'simulations', 'modules', 'analytics'] as Tab[]).map(t => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={`tcTab${tab === t ? ' active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  <Icon name={t === 'students' ? 'group' : t === 'quizzes' ? 'quiz' : t === 'simulations' ? 'security' : t === 'modules' ? 'school' : 'insights'} size={16} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  <span className="tcTabCount">
                    {t === 'students' ? students.length
                      : t === 'quizzes' ? assignedQuizzes.length
                      : t === 'simulations' ? assignedSims.length
                      : t === 'modules' ? assignedModules.length
                      : students.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="tcTabContent">
              {tab === 'students' && (
                <StudentsTab students={students} report={report} onRemove={handleRemoveStudent} />
              )}
              {tab === 'quizzes' && (
                <ResourceTab
                  resources={assignedQuizzes}
                  type="quizzes"
                  onRemove={handleRemoveResource}
                  onAssign={() => setShowAssign('quizzes')}
                />
              )}
              {tab === 'simulations' && (
                <ResourceTab
                  resources={assignedSims}
                  type="simulations"
                  onRemove={handleRemoveResource}
                  onAssign={() => setShowAssign('simulations')}
                />
              )}
              {tab === 'modules' && (
                <ResourceTab
                  resources={assignedModules}
                  type="modules"
                  onRemove={handleRemoveResource}
                  onAssign={() => setShowAssign('modules')}
                />
              )}
              {tab === 'analytics' && (
                <AnalyticsTab
                  classroomName={classroom.name}
                  loading={reportLoading}
                  report={report}
                  onReload={loadReport}
                  onDownloadCsv={downloadClassCsv}
                  onPrintPdf={printClassPdf}
                />
              )}
            </div>
          </main>

          {/* Bottom nav */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/teacher/classrooms" aria-current="page">
              <Icon name="school" size={20} /><span>Classes</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} /><span>Reports</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/resources">
              <Icon name="library_books" size={20} /><span>Resources</span>
            </Link>
            <Link className="bottomNavItem" to="/profile">
              <Icon name="person" size={20} /><span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && qrData && (
        <div className="tcModal" onClick={() => setShowQR(false)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>Classroom QR Code</h2>
              <button className="tcModalClose" onClick={() => setShowQR(false)}><Icon name="close" size={20} /></button>
            </div>
            <div className="tcQRDisplay">
              <img src={`${baseUrl}${qrData.qr_code_url}`} alt="QR Code" />
            </div>
            <div className="tcQRInfo">
              <div className="tcQRCode">{qrData.classroom_code}</div>
              <p className="tcQRUrl">{qrData.join_url}</p>
            </div>
            <div className="tcModalActions">
              <button className="moduleCta" onClick={() => { navigator.clipboard.writeText(qrData.join_url); }}>
                <Icon name="content_copy" size={16} /> Copy URL
              </button>
              <a className="moduleCta primary" href={`${baseUrl}${qrData.qr_code_url}`} download={`classroom-${qrData.classroom_code}.png`}>
                <Icon name="download" size={16} /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="tcModal" onClick={() => setShowAssign(null)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>Assign {showAssign === 'quizzes' ? 'Quiz' : showAssign === 'simulations' ? 'Simulation' : 'Module'}</h2>
              <button className="tcModalClose" onClick={() => setShowAssign(null)}><Icon name="close" size={20} /></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="tcField">
                <label>Select {showAssign === 'quizzes' ? 'Quiz' : showAssign === 'simulations' ? 'Simulation' : 'Module'}</label>
                <select value={assignId} onChange={e => setAssignId(e.target.value)} required>
                  <option value="">-- Choose --</option>
                  {showAssign === 'quizzes' && allQuizzes.map(q => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                  {showAssign === 'simulations' && allSims.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                  {showAssign === 'modules' && allModules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="tcField">
                <label>Due Date <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <input type="datetime-local" value={assignDue} onChange={e => setAssignDue(e.target.value)} />
              </div>
              {(showAssign === 'quizzes' || showAssign === 'simulations') && (
                <div className="tcField">
                  <label>
                    Time Limit <span style={{ fontWeight: 400, opacity: 0.6 }}>(minutes, optional — overrides default)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    step="1"
                    placeholder="No limit (uses quiz default)"
                    value={assignTimeLimit}
                    onChange={e => setAssignTimeLimit(e.target.value)}
                  />
                </div>
              )}
              <div className="tcModalActions">
                <button type="button" className="moduleCta" onClick={() => setShowAssign(null)}>Cancel</button>
                <button type="submit" className="moduleCta primary" disabled={assigning}>
                  {assigning ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StudentsTab({
  students,
  report,
  onRemove,
}: {
  students: ClassroomStudent[]
  report: TeacherClassroomReport | null
  onRemove: (id: number) => void
}) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name' | 'joined'>('name')

  if (students.length === 0) {
    return (
      <div className="tcEmpty">
        <Icon name="group" size={40} />
        <p>No students enrolled yet.</p>
        <p className="tcEmptyHint">Share the classroom code or QR code to let students join.</p>
      </div>
    )
  }

  const filtered = students
    .filter(s => !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : new Date(a.pivot.joined_at).getTime() - new Date(b.pivot.joined_at).getTime()
    )

  return (
    <div className="tcStudentLayout">
      {/* Table */}
      <div>
        <div className="tcStudentToolbar">
          <div className="tcStudentSearch">
            <Icon name="search" size={18} />
            <input
              type="text"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>
          <button className={`tcSortBtn${sort === 'name' ? ' active' : ''}`} onClick={() => setSort('name')}>
            <Icon name="sort_by_alpha" size={14} /> Name
          </button>
          <button className={`tcSortBtn${sort === 'joined' ? ' active' : ''}`} onClick={() => setSort('joined')}>
            <Icon name="calendar_today" size={14} /> Joined
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="tcEmpty" style={{ padding: '2rem' }}>
            <Icon name="search" size={32} /><p>No students match your search.</p>
          </div>
        ) : (
          <table className="tcStudentTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Joined</th>
                <th>Module Progress</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const prog = report?.students.find(r => r.id === s.id)
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="tcStudentName">{s.name}</div>
                      <div className="tcStudentEmail">{s.email}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(s.pivot.joined_at).toLocaleDateString()}
                    </td>
                    <td className="tcProgressCell">
                      {prog ? (
                        <>
                          <div className="tcProgressBar">
                            <div className="tcProgressBarFill" style={{ width: `${prog.modules.percent}%` }} />
                          </div>
                          <div className="tcProgressPct">{prog.modules.completed}/{prog.modules.total} · {prog.modules.percent}%</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="tcRemoveBtn" onClick={() => onRemove(s.id)} title="Remove student">
                        <Icon name="person_remove" size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Right sidebar stats */}
      <aside className="tcStudentSidebar">
        <p className="tcSidebarTitle">Class Stats</p>
        <div className="tcSidebarStat">
          <span className="tcSidebarStatVal">{students.length}</span>
          <span className="tcSidebarStatLabel">Students</span>
        </div>
        <div className="tcSidebarStat">
          <span className="tcSidebarStatVal">{report ? `${Math.round(report.summary.avg_module_completion_percent)}%` : '—'}</span>
          <span className="tcSidebarStatLabel">Avg Module Completion</span>
        </div>
        <div className="tcSidebarStat">
          <span className="tcSidebarStatVal">{report ? `${Math.round(report.summary.avg_quiz_percent)}%` : '—'}</span>
          <span className="tcSidebarStatLabel">Avg Quiz Score</span>
        </div>
        <div className="tcSidebarStat">
          <span className="tcSidebarStatVal">{report ? `${Math.round(report.summary.avg_simulation_percent)}%` : '—'}</span>
          <span className="tcSidebarStatLabel">Avg Simulation Score</span>
        </div>
      </aside>
    </div>
  )
}

function ResourceTab({
  resources,
  type,
  onRemove,
  onAssign,
}: {
  resources: ClassroomResource[]
  type: Tab
  onRemove: (id: number, type: Tab) => void
  onAssign: () => void
}) {
  const label = type === 'quizzes' ? 'Quiz' : type === 'simulations' ? 'Simulation' : 'Module'
  const icon = type === 'quizzes' ? 'quiz' : type === 'simulations' ? 'security' : 'school'

  return (
    <div>
      <div className="tcResourceHeader">
        <span className="teacherSectionTitle">Assigned {type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <button className="moduleCta primary" onClick={onAssign}>
          <Icon name="add" size={16} /> Assign {label}
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="tcEmpty">
          <Icon name={icon} size={40} />
          <p>No {type} assigned yet.</p>
          <button className="moduleCta primary" onClick={onAssign}>
            <Icon name="add" size={16} /> Assign {label}
          </button>
        </div>
      ) : (
        <div className="tcList">
          {resources.map(r => (
            <div key={r.id} className="tcListItem">
              <div className="tcListIcon">
                <Icon name={icon} size={20} />
              </div>
              <div className="tcListInfo">
                <strong>{r.title}</strong>
                {r.description && <span>{r.description}</span>}
                {r.pivot.due_date && (
                  <span className="tcDueBadge">
                    <Icon name="schedule" size={12} /> Due {new Date(r.pivot.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button className="tcRemoveBtn" onClick={() => onRemove(r.id, type)} title="Remove">
                <Icon name="delete" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalyticsTab({
  classroomName,
  loading,
  report,
  onReload,
  onDownloadCsv,
  onPrintPdf,
}: {
  classroomName: string
  loading: boolean
  report: TeacherClassroomReport | null
  onReload: () => void
  onDownloadCsv: () => void
  onPrintPdf: () => void
}) {
  if (loading) {
    return <div className="modulesLoading">Loading analytics…</div>
  }

  if (!report) {
    return (
      <div className="tcEmpty">
        <Icon name="insights" size={40} />
        <p>Analytics not available.</p>
        <button className="moduleCta primary" onClick={onReload}>
          <Icon name="refresh" size={16} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="tcResourceHeader">
        <span className="teacherSectionTitle">Classroom Analytics</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="moduleCta" onClick={onDownloadCsv}>
            <Icon name="download" size={16} /> Download CSV
          </button>
          <button className="moduleCta primary" onClick={onPrintPdf}>
            <Icon name="description" size={16} /> Generate PDF
          </button>
        </div>
      </div>

      <div className="teacherStats" style={{ marginBottom: 14 }}>
        <div className="teacherStat">
          <span className="teacherStatVal">{report.totals.students}</span>
          <span className="teacherStatLabel">Students</span>
        </div>
        <div className="teacherStat">
          <span className="teacherStatVal">{report.summary.avg_module_completion_percent}%</span>
          <span className="teacherStatLabel">Avg Module Completion</span>
        </div>
        <div className="teacherStat">
          <span className="teacherStatVal">{report.summary.avg_quiz_percent}%</span>
          <span className="teacherStatLabel">Avg Quiz Score</span>
        </div>
        <div className="teacherStat">
          <span className="teacherStatVal">{report.summary.avg_simulation_percent}%</span>
          <span className="teacherStatLabel">Avg Simulation Score</span>
        </div>
      </div>

      {report.students.length === 0 ? (
        <div className="tcEmpty">
          <Icon name="group" size={40} />
          <p>No students enrolled yet.</p>
        </div>
      ) : (
        <div className="tcList" aria-label="Student progress list">
          {report.students.map(s => (
            <div key={s.id} className="tcListItem" style={{ alignItems: 'flex-start' }}>
              <div className="tcListAvatar">{s.name.charAt(0).toUpperCase()}</div>
              <div className="tcListInfo" style={{ gap: 4 }}>
                <strong>{s.name}</strong>
                <span>{s.email}</span>
                <span className="tcListMeta">XP: {s.xp} · Last active: {s.last_login_at ? new Date(s.last_login_at).toLocaleString() : '—'}</span>
                <span className="tcListMeta">
                  Modules: {s.modules.completed}/{s.modules.total} ({s.modules.percent}%)
                  {' · '}Quizzes avg: {s.quizzes.avg_percent}%
                  {' · '}Simulations avg: {s.simulations.avg_percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tcEmptyHint" style={{ marginTop: 12 }}>
        Report for: <strong>{classroomName}</strong> · Generated at {new Date(report.generated_at).toLocaleString()}
      </div>
    </div>
  )
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildClassroomPrintHtml(report: TeacherClassroomReport) {
  const rows = report.students
    .map(s => {
      const lastActive = s.last_login_at ? new Date(s.last_login_at).toLocaleString() : '—'
      return `<tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td style="text-align:right">${s.xp}</td>
        <td>${escapeHtml(lastActive)}</td>
        <td style="text-align:right">${s.modules.completed}/${s.modules.total}</td>
        <td style="text-align:right">${s.modules.percent.toFixed(1)}%</td>
        <td style="text-align:right">${s.quizzes.avg_percent.toFixed(1)}%</td>
        <td style="text-align:right">${s.simulations.avg_percent.toFixed(1)}%</td>
      </tr>`
    })
    .join('\n')

  return `<!doctype html>
  <html><head><meta charset="utf-8" />
  <title>Classroom Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 6px; }
    .meta { color: #444; font-size: 12px; margin-bottom: 16px; }
    .cards { display: flex; gap: 12px; margin: 12px 0 18px; flex-wrap: wrap; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; min-width: 180px; }
    .card .val { font-size: 16px; font-weight: 700; }
    .card .lbl { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; font-size: 12px; vertical-align: top; }
    th { text-align: left; border-bottom: 2px solid #ddd; }
  </style>
  </head>
  <body>
    <h1>Classroom Report: ${escapeHtml(report.classroom.name)}</h1>
    <div class="meta">Code: ${escapeHtml(report.classroom.code)} · Generated at: ${escapeHtml(report.generated_at)}</div>

    <div class="cards">
      <div class="card"><div class="val">${report.totals.students}</div><div class="lbl">Students</div></div>
      <div class="card"><div class="val">${report.summary.avg_module_completion_percent.toFixed(1)}%</div><div class="lbl">Avg Module Completion</div></div>
      <div class="card"><div class="val">${report.summary.avg_quiz_percent.toFixed(1)}%</div><div class="lbl">Avg Quiz Score</div></div>
      <div class="card"><div class="val">${report.summary.avg_simulation_percent.toFixed(1)}%</div><div class="lbl">Avg Simulation Score</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Email</th>
          <th style="text-align:right">XP</th>
          <th>Last Active</th>
          <th style="text-align:right">Modules</th>
          <th style="text-align:right">Module %</th>
          <th style="text-align:right">Quiz Avg</th>
          <th style="text-align:right">Simulation Avg</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body></html>`
}
