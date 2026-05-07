import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { teacherClassroomAPI, teacherReportsAPI, type Classroom, type TeacherSummaryReport } from '../api/classrooms'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'

export default function TeacherDashboardPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  const [summary, setSummary] = useState<TeacherSummaryReport | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    load()
    loadSummary()
  }, [user])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await teacherClassroomAPI.getClassrooms()
      setClassrooms(data.classrooms)
    } catch {
      setError('Failed to load classrooms.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSummary() {
    setSummaryLoading(true)
    try {
      const data = await teacherReportsAPI.getSummary()
      setSummary(data)
    } catch {
      setSummary(null)
    } finally {
      setSummaryLoading(false)
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

  async function downloadSummaryCsv() {
    try {
      const blob = await teacherReportsAPI.downloadSummaryCsv()
      downloadBlob(blob, 'teacher-summary-report.csv')
    } catch {
      alert('Failed to download report.')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      await teacherClassroomAPI.createClassroom({ name: form.name.trim(), description: form.description.trim() || undefined })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      load()
    } catch {
      alert('Failed to create classroom.')
    } finally {
      setCreating(false)
    }
  }

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession() } catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  if (!user) return null

  const active = classrooms.filter(c => c.status === 'active')
  const archived = classrooms.filter(c => c.status === 'archived')
  const totalStudents = classrooms.reduce((s, c) => s + (c.students_count ?? 0), 0)
  const avgCompletion = summary?.averages.avg_module_completion_percent ?? null

  const filteredActive = search.trim()
    ? active.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : active

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
            <Link className="modulesNavItem" to="/teacher/feedback">
              <Icon name="feedback" size={20} /><span>Feedback</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <Icon name="person" size={20} /><span>Profile</span>
            </Link>
            {user.role === 'admin' && (
              <Link className="modulesNavItem" to="/admin/dashboard">
                <Icon name="admin_panel_settings" size={20} /><span>Admin</span>
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

        {/* ── Main ── */}
        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img src="/cats logo.png" alt="CATS Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12 }} />
                <div>
                  <div className="modulesTitle">Classrooms</div>
                  <div className="modulesSubtitle">{user.name || 'Teacher'}</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* Hero */}
            <section className="modulesHero">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Welcome, {user.name?.split(' ')[0] || 'Teacher'}!</h1>
                  <p className="modulesHeroText">Start here: create a classroom, share the code/QR, assign resources, then monitor progress.</p>
                </div>
                <div className="teacherStats">
                  <div className="teacherStat">
                    <span className="teacherStatVal">{active.length}</span>
                    <span className="teacherStatLabel">Active Classes</span>
                  </div>
                  <div className="teacherStat">
                    <span className="teacherStatVal">{totalStudents}</span>
                    <span className="teacherStatLabel">Total Students</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Reports */}
            <section className="modulesHero" style={{ marginTop: '1rem' }}>
              <div className="modulesHeroInner" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="teacherSectionTitle">Quick Reports</h2>
                  <p className="modulesHeroText" style={{ marginTop: 6 }}>
                    Download a summary, or open Reports to filter by date range.
                  </p>
                  <div className="tcHeroActions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 10 }}>
                    <button className="tcHeroBtn" onClick={downloadSummaryCsv} disabled={summaryLoading}>
                      <Icon name="download" size={16} /> Download Summary (CSV)
                    </button>
                    <button className="tcHeroBtn" onClick={() => navigate('/teacher/reports')}>
                      <Icon name="assessment" size={16} /> Open Reports
                    </button>
                  </div>
                </div>

                <div className="teacherStats" aria-label="Overall analytics">
                  <div className="teacherStat">
                    <span className="teacherStatVal">{summary?.totals.classrooms ?? active.length + archived.length}</span>
                    <span className="teacherStatLabel">Classrooms</span>
                  </div>
                  <div className="teacherStat">
                    {summaryLoading ? (
                      <span className="teacherStatVal statSkeleton">—</span>
                    ) : avgCompletion !== null && avgCompletion > 0 ? (
                      <span className="teacherStatVal">{avgCompletion}%</span>
                    ) : (
                      <span className="statContextual">Assign modules<br />to track progress</span>
                    )}
                    <span className="teacherStatLabel">Avg Module Completion</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Action bar */}
            <div className="teacherActionBar">
              <h2 className="teacherSectionTitle">My Classrooms</h2>
              <button className="moduleCta primary" onClick={() => setShowCreate(true)}>
                <Icon name="add" size={18} /> New Classroom
              </button>
            </div>

            {/* Search bar — only visible when there are classrooms */}
            {active.length > 0 && (
              <div className="modulesSearch classroomSearch">
                <Icon name="search" size={20} />
                <input
                  id="classroom-search"
                  type="text"
                  placeholder="Search by name or join code…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search classrooms"
                />
                {search && (
                  <button type="button" className="classroomSearchClear" onClick={() => setSearch('')} aria-label="Clear search">
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
            )}

            {error && <div className="modulesError">{error}</div>}

            {/* Active classrooms */}
            {loading ? (
              <div className="modulesLoading">Loading classrooms…</div>
            ) : active.length === 0 ? (
              <div className="teacherEmpty">
                <Icon name="school" size={48} />
                <p>No classrooms yet. Create your first one!</p>
                <button className="moduleCta primary" onClick={() => setShowCreate(true)}>
                  <Icon name="add" size={18} /> Create Classroom
                </button>
              </div>
            ) : filteredActive.length === 0 ? (
              <div className="teacherEmpty">
                <Icon name="search" size={48} />
                <p>No classrooms match "<strong>{search}</strong>"</p>
                <button className="moduleCta" onClick={() => setSearch('')}>Clear search</button>
              </div>
            ) : (
              <div className="modulesGrid">
                {filteredActive.map(c => {
                  const sd = summary?.classrooms.find(sc => sc.id === c.id)
                  return (
                    <ClassroomCard
                      key={c.id}
                      classroom={c}
                      summaryData={sd}
                      onRefresh={load}
                      onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                    />
                  )
                })}
              </div>
            )}

            {/* Archived */}
            {archived.length > 0 && (
              <>
                <h2 className="teacherSectionTitle" style={{ marginTop: '2rem' }}>Archived</h2>
                <div className="modulesGrid">
                  {archived.map(c => {
                    const sd = summary?.classrooms.find(sc => sc.id === c.id)
                    return (
                      <ClassroomCard
                        key={c.id}
                        classroom={c}
                        archived
                        summaryData={sd}
                        onRefresh={load}
                        onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </main>

          {/* Bottom nav (mobile) — already position:fixed in ModulesPage.css */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/teacher/classrooms" aria-current="page">
              <Icon name="school" size={20} /><span>Classes</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/reports"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="bottomNavItem" to="/teacher/feedback"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="tcModal" role="dialog" aria-modal="true" aria-label="Create classroom">
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>Create Classroom</h2>
              <button className="tcModalClose" onClick={() => setShowCreate(false)} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="tcField">
                <label htmlFor="cn">Classroom Name *</label>
                <input
                  id="cn"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Cybersecurity 101"
                  required
                  autoFocus
                />
              </div>
              <div className="tcField">
                <label htmlFor="cd">Description</label>
                <textarea
                  id="cd"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description (optional)"
                  rows={3}
                />
              </div>
              <div className="tcModalActions">
                <button type="button" className="moduleCta" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="moduleCta primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ClassroomCard ─────────────────────────────────────────────────────────────

type SummaryData = {
  avg_module_completion_percent: number
  avg_quiz_percent: number
  avg_simulation_percent: number
  students: number
} | undefined

function ClassroomCard({
  classroom: c,
  archived = false,
  onClick,
  summaryData,
  onRefresh,
}: {
  classroom: Classroom
  archived?: boolean
  onClick: () => void
  summaryData?: SummaryData
  onRefresh: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(c.name)
  const [editDesc, setEditDesc] = useState(c.description || '')
  const [saving, setSaving] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(c.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleArchiveToggle(e: React.MouseEvent) {
    e.stopPropagation()
    setMenuOpen(false)
    try {
      await teacherClassroomAPI.updateClassroom(c.id, { status: c.status === 'active' ? 'archived' : 'active' })
      onRefresh()
    } catch {
      alert('Failed to update classroom.')
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    try {
      await teacherClassroomAPI.updateClassroom(c.id, { name: editName.trim(), description: editDesc.trim() || undefined })
      setEditOpen(false)
      onRefresh()
    } catch {
      alert('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const pct = summaryData?.avg_module_completion_percent ?? null
  const hasStudents = (c.students_count ?? 0) > 0

  return (
    <>
      <article
        className={`moduleCard teacherCard${archived ? ' teacherCardArchived' : ''}`}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="moduleBody compact">

          {/* Top row: icon + ⋯ menu */}
          <div className="teacherCardTop">
            <div className="moduleIcon" aria-hidden="true">
              <Icon name="school" size={24} />
            </div>
            <div className="cardMenuWrap" ref={menuRef}>
              <button
                type="button"
                className="cardMenuBtn"
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <Icon name="more_vert" size={20} />
              </button>
              {menuOpen && (
                <div className="cardMenuDropdown" role="menu">
                  <button
                    role="menuitem"
                    className="cardMenuDropdownItem"
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setEditOpen(true) }}
                  >
                    <Icon name="edit" size={16} /> Edit
                  </button>
                  <button
                    role="menuitem"
                    className="cardMenuDropdownItem"
                    onClick={e => { e.stopPropagation(); copyCode(e) }}
                  >
                    <Icon name="content_copy" size={16} /> Copy Code
                  </button>
                  <button
                    role="menuitem"
                    className="cardMenuDropdownItem cardMenuDanger"
                    onClick={handleArchiveToggle}
                  >
                    <Icon name={archived ? 'unarchive' : 'archive'} size={16} />
                    {archived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Join code — blurred by default, reveals on hover; copy button always visible */}
          <div className="teacherCodeWrap" onClick={e => e.stopPropagation()}>
            <span className="teacherCodeBlurred" aria-label="Join code (hover to reveal)">{c.code}</span>
            <button type="button" className="teacherCodeCopyBtn" onClick={copyCode} aria-label="Copy join code">
              <Icon name={copied ? 'check' : 'content_copy'} size={14} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="moduleHeader">
            <h2 className="moduleTitle">{c.name}</h2>
            {archived && <span className="moduleStatus" style={{ color: 'var(--text-muted)' }}>Archived</span>}
          </div>
          <p className="moduleDesc">{c.description || 'No description'}</p>

          <div className="moduleMeta">
            <div className="moduleMetaRow">
              <span><Icon name="group" size={14} style={{ verticalAlign: 'middle' }} /> {c.students_count ?? 0} students</span>
              {!hasStudents ? (
                <span className="cardNoStudents">No students yet</span>
              ) : pct !== null ? (
                <span className="inProgress">{Math.round(pct)}% done</span>
              ) : (
                <span className="inProgress">Active</span>
              )}
            </div>

            {/* Progress bar — only when there are students and summary data is available */}
            {hasStudents && pct !== null && (
              <div className="cardProgressWrap">
                <div className="moduleProgress thin">
                  <div className="moduleProgressInner" style={{ width: `${Math.round(pct)}%` }} />
                </div>
                <div className="cardProgressLabel">
                  <span>Module completion</span>
                  <span>{Math.round(pct)}%</span>
                </div>
              </div>
            )}

            <button type="button" className="moduleCta" style={{ marginTop: 12, width: '100%' }}>
              View Details
            </button>
          </div>
        </div>
      </article>

      {/* Inline edit modal */}
      {editOpen && (
        <div className="tcModal" role="dialog" aria-modal="true" aria-label="Edit classroom" onClick={() => setEditOpen(false)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>Edit Classroom</h2>
              <button className="tcModalClose" onClick={() => setEditOpen(false)} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="tcField">
                <label htmlFor={`en-${c.id}`}>Classroom Name *</label>
                <input
                  id={`en-${c.id}`}
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="tcField">
                <label htmlFor={`ed-${c.id}`}>Description</label>
                <textarea
                  id={`ed-${c.id}`}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="tcModalActions">
                <button type="button" className="moduleCta" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="moduleCta primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
