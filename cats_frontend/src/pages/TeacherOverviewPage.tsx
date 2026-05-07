import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { teacherClassroomAPI, teacherReportsAPI, type Classroom, type TeacherSummaryReport } from '../api/classrooms'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'

export default function TeacherOverviewPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState<TeacherSummaryReport | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    loadClassrooms()
    loadSummary()
  }, [user])

  async function loadClassrooms() {
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

  function printSummaryPdf() {
    if (!summary) {
      alert('Summary report not loaded yet.')
      return
    }
    const html = buildSummaryPrintHtml(summary)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  const active = useMemo(() => classrooms.filter(c => c.status === 'active'), [classrooms])
  const archived = useMemo(() => classrooms.filter(c => c.status === 'archived'), [classrooms])
  const totalStudents = useMemo(() => classrooms.reduce((s, c) => s + (c.students_count ?? 0), 0), [classrooms])

  const lowProgressClassrooms = useMemo(() => {
    if (!summary) return 0
    return summary.classrooms.filter(c => c.avg_module_completion_percent < 50).length
  }, [summary])

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
            <Link className="modulesNavItem active" to="/teacher/dashboard" aria-current="page">
              <Icon name="dashboard" size={20} />
              <span>Dashboard</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/classrooms">
              <Icon name="school" size={20} />
              <span>Classrooms</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} />
              <span>Reports</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/resources">
              <Icon name="library_books" size={20} />
              <span>Resources</span>
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
                  <div className="modulesTitle">Dashboard</div>
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
                  <p className="modulesHeroText">Overview of your classes and student progress.</p>
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

            {/* Analytics */}
            <section className="modulesHero" style={{ marginTop: '1rem' }}>
              <div className="modulesHeroInner" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="teacherSectionTitle">Analytics</h2>
                  <p className="modulesHeroText" style={{ marginTop: 6 }}>
                    Download an overall summary, or go deeper in Reports.
                  </p>

                  <div className="tcHeroActions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 10 }}>
                    <button
                      className="tcHeroBtn"
                      onClick={downloadSummaryCsv}
                      disabled={summaryLoading}
                    >
                      <Icon name="download" size={16} /> Download Summary (CSV)
                    </button>
                    <button
                      className="tcHeroBtn"
                      onClick={printSummaryPdf}
                      disabled={summaryLoading || !summary}
                    >
                      <Icon name="description" size={16} /> Generate Summary (PDF)
                    </button>
                    <button
                      className="tcHeroBtn"
                      onClick={() => navigate('/teacher/reports')}
                    >
                      <Icon name="assessment" size={16} /> Open Reports
                    </button>
                  </div>
                </div>

                <div className="teacherStats" aria-label="Overall analytics">
                  <div className="teacherStat">
                    {summaryLoading ? (
                      <span className="teacherStatVal statSkeleton">—</span>
                    ) : summary && summary.averages.avg_module_completion_percent > 0 ? (
                      <span className="teacherStatVal">{summary.averages.avg_module_completion_percent}%</span>
                    ) : (
                      <span className="statContextual">Assign modules<br />to track progress</span>
                    )}
                    <span className="teacherStatLabel">Avg Module Completion</span>
                  </div>
                  <div className="teacherStat">
                    <span className="teacherStatVal">{lowProgressClassrooms}</span>
                    <span className="teacherStatLabel">Classes Need Attention</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick classrooms */}
            <div className="teacherActionBar">
              <h2 className="teacherSectionTitle">Recent Classrooms</h2>
              <button className="moduleCta" onClick={() => navigate('/teacher/classrooms')}>
                <Icon name="school" size={18} /> View All
              </button>
            </div>

            {error && <div className="modulesError">{error}</div>}

            {loading ? (
              <div className="modulesLoading">Loading…</div>
            ) : active.length === 0 ? (
              <div className="teacherEmpty">
                <Icon name="school" size={48} />
                <p>No classrooms yet. Create one from the Classrooms page.</p>
                <button className="moduleCta primary" onClick={() => navigate('/teacher/classrooms')}>
                  <Icon name="arrow_forward" size={18} /> Go to Classrooms
                </button>
              </div>
            ) : (
              <div className="modulesGrid">
                {active.slice(0, 6).map(c => {
                  const sd = summary?.classrooms.find(sc => sc.id === c.id)
                  return (
                    <ClassroomCard
                      key={c.id}
                      classroom={c}
                      summaryData={sd}
                      onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                    />
                  )
                })}
              </div>
            )}

            {archived.length > 0 && (
              <p className="modulesHeroText" style={{ marginTop: '1rem' }}>
                You have {archived.length} archived classroom(s).
              </p>
            )}
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/teacher/dashboard" aria-current="page">
              <Icon name="dashboard" size={20} />
              <span>Dashboard</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/classrooms">
              <Icon name="school" size={20} />
              <span>Classes</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/reports">
              <Icon name="assessment" size={20} />
              <span>Reports</span>
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

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildSummaryPrintHtml(summary: TeacherSummaryReport) {
  const rows = summary.classrooms
    .map(c => {
      return `<tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.code)}</td>
        <td style="text-align:right">${c.students}</td>
        <td style="text-align:right">${c.avg_module_completion_percent.toFixed(1)}%</td>
        <td style="text-align:right">${c.avg_quiz_percent.toFixed(1)}%</td>
        <td style="text-align:right">${c.avg_simulation_percent.toFixed(1)}%</td>
      </tr>`
    })
    .join('\n')

  return `<!doctype html>
  <html><head><meta charset="utf-8" />
  <title>Teacher Summary Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 6px; }
    .meta { color: #444; font-size: 12px; margin-bottom: 16px; }
    .cards { display: flex; gap: 12px; margin: 12px 0 18px; flex-wrap: wrap; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; min-width: 180px; }
    .card .val { font-size: 16px; font-weight: 700; }
    .card .lbl { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; font-size: 12px; }
    th { text-align: left; border-bottom: 2px solid #ddd; }
  </style>
  </head>
  <body>
    <h1>Teacher Summary Report</h1>
    <div class="meta">Generated at: ${escapeHtml(summary.generated_at)}</div>
    <div class="cards">
      <div class="card"><div class="val">${summary.totals.classrooms}</div><div class="lbl">Classrooms</div></div>
      <div class="card"><div class="val">${summary.totals.students}</div><div class="lbl">Students</div></div>
      <div class="card"><div class="val">${summary.averages.avg_module_completion_percent.toFixed(1)}%</div><div class="lbl">Avg Module Completion</div></div>
      <div class="card"><div class="val">${summary.averages.avg_quiz_percent.toFixed(1)}%</div><div class="lbl">Avg Quiz Score</div></div>
      <div class="card"><div class="val">${summary.averages.avg_simulation_percent.toFixed(1)}%</div><div class="lbl">Avg Simulation Score</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Classroom</th>
          <th>Code</th>
          <th style="text-align:right">Students</th>
          <th style="text-align:right">Module Completion</th>
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

function ClassroomCard({
  classroom: c,
  onClick,
  summaryData,
}: {
  classroom: Classroom
  onClick: () => void
  summaryData?: { avg_module_completion_percent: number; students: number }
}) {
  const [copied, setCopied] = useState(false)

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(c.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const pct = summaryData?.avg_module_completion_percent ?? null
  const hasStudents = (c.students_count ?? 0) > 0

  return (
    <article className="moduleCard teacherCard" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="moduleBody compact">
        <div className="teacherCardTop">
          <div className="moduleIcon" aria-hidden="true">
            <Icon name="school" size={24} />
          </div>
        </div>

        {/* Join code — blurred by default */}
        <div className="teacherCodeWrap" onClick={e => e.stopPropagation()}>
          <span className="teacherCodeBlurred" aria-label="Join code (hover to reveal)">{c.code}</span>
          <button type="button" className="teacherCodeCopyBtn" onClick={copyCode} aria-label="Copy join code">
            <Icon name={copied ? 'check' : 'content_copy'} size={14} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="moduleHeader">
          <h2 className="moduleTitle">{c.name}</h2>
        </div>
        <p className="moduleDesc">{c.description || 'No description'}</p>
        <div className="moduleMeta">
          <div className="moduleMetaRow">
            <span>
              <Icon name="group" size={14} style={{ verticalAlign: 'middle' }} />{' '}
              {c.students_count ?? 0} students
            </span>
            {!hasStudents ? (
              <span className="cardNoStudents">No students yet</span>
            ) : pct !== null ? (
              <span className="inProgress">{Math.round(pct)}% done</span>
            ) : (
              <span className="inProgress">Active</span>
            )}
          </div>
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
  )
}
