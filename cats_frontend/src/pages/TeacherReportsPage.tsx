import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  teacherClassroomAPI,
  teacherReportsAPI,
  type Classroom,
  type TeacherClassroomReport,
  type TeacherSummaryReport,
} from '../api/classrooms'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './TeacherDashboardPage.css'

export default function TeacherReportsPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loadingClassrooms, setLoadingClassrooms] = useState(true)

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const [summary, setSummary] = useState<TeacherSummaryReport | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null)
  const [classReport, setClassReport] = useState<TeacherClassroomReport | null>(null)
  const [classReportLoading, setClassReportLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    loadClassrooms()
  }, [user])

  useEffect(() => {
    if (!user) return
    loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function loadClassrooms() {
    setLoadingClassrooms(true)
    try {
      const data = await teacherClassroomAPI.getClassrooms()
      setClassrooms(data.classrooms)
      const active = data.classrooms.filter(c => c.status === 'active')
      const firstId = active[0]?.id ?? data.classrooms[0]?.id ?? null
      setSelectedClassroomId(firstId)
      if (firstId) loadClassroomReport(firstId)
    } catch {
      setClassrooms([])
      setSelectedClassroomId(null)
    } finally {
      setLoadingClassrooms(false)
    }
  }

  function buildParams(from = fromDate, to = toDate) {
    const p: { from?: string; to?: string } = {}
    if (from) p.from = from
    if (to) p.to = to
    return p
  }

  async function loadSummary(from = fromDate, to = toDate) {
    setSummaryLoading(true)
    try { setSummary(await teacherReportsAPI.getSummary(buildParams(from, to))) }
    catch { setSummary(null) }
    finally { setSummaryLoading(false) }
  }

  async function loadClassroomReport(classroomId: number | null, from = fromDate, to = toDate) {
    if (!classroomId) return
    setClassReportLoading(true)
    try { setClassReport(await teacherReportsAPI.getClassroom(classroomId, buildParams(from, to))) }
    catch { setClassReport(null) }
    finally { setClassReportLoading(false) }
  }

  function applyPreset(preset: '7d' | '30d' | 'month' | 'semester') {
    const now = new Date()
    const to = now.toISOString().slice(0, 10)
    const d = new Date(now)
    let from = ''
    if (preset === '7d') { d.setDate(d.getDate() - 7); from = d.toISOString().slice(0, 10) }
    else if (preset === '30d') { d.setDate(d.getDate() - 30); from = d.toISOString().slice(0, 10) }
    else if (preset === 'month') { from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` }
    else { d.setMonth(d.getMonth() - 6); from = d.toISOString().slice(0, 10) }
    setFromDate(from); setToDate(to)
    loadSummary(from, to)
    if (selectedClassroomId) loadClassroomReport(selectedClassroomId, from, to)
  }

  function clearDates() {
    setFromDate(''); setToDate('')
    loadSummary('', '')
    if (selectedClassroomId) loadClassroomReport(selectedClassroomId, '', '')
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
    try { downloadBlob(await teacherReportsAPI.downloadSummaryCsv(buildParams()), 'teacher-summary-report.csv') }
    catch { alert('Failed to download report.') }
  }

  function printSummaryPdf() {
    if (!summary) {
      alert('Summary report not loaded yet.')
      return
    }
    const html = buildSummaryPrintHtml(summary, fromDate, toDate)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  async function downloadClassroomCsv() {
    if (!selectedClassroomId) return
    try { downloadBlob(await teacherReportsAPI.downloadClassroomCsv(selectedClassroomId, buildParams()), `classroom-${selectedClassroomId}-report.csv`) }
    catch { alert('Failed to download report.') }
  }

  function printClassroomPdf() {
    if (!classReport) {
      alert('Classroom report not loaded yet.')
      return
    }
    const html = buildClassroomPrintHtml(classReport, fromDate, toDate)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
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

  const activeClassrooms = useMemo(
    () => classrooms.filter(c => c.status === 'active'),
    [classrooms],
  )

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
            <Link className="modulesNavItem active" to="/teacher/reports" aria-current="page">
              <Icon name="assessment" size={20} />
              <span>Reports</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/resources">
              <Icon name="library_books" size={20} />
              <span>Resources</span>
            </Link>
            <Link className="modulesNavItem" to="/teacher/feedback">
              <Icon name="feedback" size={20} />
              <span>Feedback</span>
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
                  <div className="modulesTitle">Reports</div>
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
                  <h1 className="modulesHeroTitle">Reports</h1>
                  <p className="modulesHeroText" style={{ marginBottom: 10 }}>Filter by date, then export or drill into any classroom.</p>

                  <div className="rptDateRow">
                    <input className="rptDateInput" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} aria-label="From date" />
                    <span className="rptDateSep">→</span>
                    <input className="rptDateInput" type="date" value={toDate} onChange={e => setToDate(e.target.value)} aria-label="To date" />
                    <button className="moduleCta" onClick={() => { loadSummary(); if (selectedClassroomId) loadClassroomReport(selectedClassroomId) }} disabled={summaryLoading || classReportLoading}>
                      <Icon name="refresh" size={16} /> Apply
                    </button>
                    {(fromDate || toDate) && (
                      <button className="moduleCta" onClick={clearDates} disabled={summaryLoading || classReportLoading}>
                        <Icon name="cancel" size={16} /> Clear
                      </button>
                    )}
                  </div>

                  <div className="rptPresets">
                    {(['7d','30d','month','semester'] as const).map(p => (
                      <button key={p} className="rptPresetChip" onClick={() => applyPreset(p)}>
                        {p==='7d'?'Last 7 days':p==='30d'?'Last 30 days':p==='month'?'This month':'This semester'}
                      </button>
                    ))}
                  </div>

                  <div className="tcHeroActions" style={{ borderTop:'none', paddingTop:0, marginTop:4 }}>
                    <button className="tcHeroBtn" onClick={downloadSummaryCsv} disabled={summaryLoading}><Icon name="download" size={16} /> Summary CSV</button>
                    <button className="tcHeroBtn" onClick={printSummaryPdf} disabled={summaryLoading||!summary}><Icon name="description" size={16} /> Summary PDF</button>
                  </div>
                </div>

                <div className="teacherStats" aria-label="Summary KPIs">
                  <div className="teacherStat">
                    <span className="teacherStatVal">{summary?.totals.students ?? '—'}</span>
                    <span className="teacherStatLabel">Students</span>
                  </div>
                  <div className="teacherStat">
                    <span className="teacherStatVal">{summary?.totals.classrooms ?? '—'}</span>
                    <span className="teacherStatLabel">Classrooms</span>
                  </div>
                  <div className="teacherStat">
                    {summaryLoading ? (
                      <span className="teacherStatVal statSkeleton">—</span>
                    ) : summary && summary.averages.avg_module_completion_percent > 0 ? (
                      <span className="teacherStatVal">{Math.round(summary.averages.avg_module_completion_percent)}%</span>
                    ) : (
                      <span className="statContextual">No modules<br />assigned yet</span>
                    )}
                    <span className="teacherStatLabel">Avg Module Completion</span>
                  </div>
                  <div className="teacherStat">
                    <span className="teacherStatVal">{summary ? `${Math.round(summary.averages.avg_quiz_percent)}%` : '—'}</span>
                    <span className="teacherStatLabel">Avg Quiz Score</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="rptLayout" style={{ marginTop: '1.5rem' }}>
              {/* Left controls panel */}
              <div className="rptControlPanel">
                <div className="teacherActionBar" style={{ marginBottom: 8 }}>
                  <h2 className="teacherSectionTitle">Classroom Report</h2>
                  <button className="moduleCta" style={{ padding:'6px 10px', fontSize:'0.75rem' }} onClick={() => navigate('/teacher/classrooms')}>
                    <Icon name="school" size={14} /> Manage
                  </button>
                </div>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', margin:'0 0 12px' }}>Select a classroom — report loads instantly.</p>
                <div className="tcField">
                  <label htmlFor="classroomSelect">Classroom</label>
                  <select
                    id="classroomSelect"
                    value={selectedClassroomId ?? ''}
                    onChange={e => {
                      const next = e.target.value ? Number(e.target.value) : null
                      setSelectedClassroomId(next)
                      setClassReport(null)
                      if (next) loadClassroomReport(next)
                    }}
                    disabled={loadingClassrooms}
                  >
                    <option value="">— Select —</option>
                    {activeClassrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                  <button className="moduleCta" onClick={downloadClassroomCsv} disabled={!selectedClassroomId||classReportLoading}>
                    <Icon name="download" size={16} /> CSV
                  </button>
                  <button className="moduleCta" onClick={printClassroomPdf} disabled={!classReport}>
                    <Icon name="description" size={16} /> PDF
                  </button>
                </div>
                {classReport && (
                  <div style={{ marginTop:16 }}>
                    <p style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', margin:'0 0 8px' }}>Class Summary</p>
                    <div className="rptStatGrid">
                    {([
                      [classReport.totals.students, 'Students'],
                      [`${Math.round(classReport.summary.avg_module_completion_percent)}%`, 'Avg Module'],
                      [`${Math.round(classReport.summary.avg_quiz_percent)}%`, 'Avg Quiz'],
                      [`${Math.round(classReport.summary.avg_simulation_percent)}%`, 'Avg Sim'],
                    ] as [string|number, string][]).map(([val, label]) => (
                      <div key={label} className="rptStat">
                        <span className="rptStatVal">{val}</span>
                        <span className="rptStatLabel">{label}</span>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right output panel */}
              <div className="rptOutputPanel">
                {classReportLoading ? (
                  <div className="rptSkeleton">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="rptSkeletonRow">
                        <div className="rptSkeletonAvatar" />
                        <div style={{ flex:1 }}>
                          <div className="rptSkeletonLine" style={{ width:'55%' }} />
                          <div className="rptSkeletonLine" style={{ width:'35%', marginTop:6 }} />
                        </div>
                        <div className="rptSkeletonBar" />
                      </div>
                    ))}
                  </div>
                ) : !selectedClassroomId ? (
                  <div className="tcEmpty">
                    <Icon name="bar_chart" size={40} />
                    <p>Select a classroom to see the report.</p>
                    <p className="tcEmptyHint">Data appears instantly — no extra clicks needed.</p>
                  </div>
                ) : !classReport ? (
                  <div className="tcEmpty">
                    <Icon name="hourglass_empty" size={40} />
                    <p>No report data for this classroom yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="rptPanelHeader">
                      <h3>{classReport.classroom.name} <span style={{ fontWeight:400, fontSize:'0.85rem', color:'var(--text-muted)' }}>({classReport.totals.students} students)</span></h3>
                      <span className="rptPanelMeta">Generated: {new Date(classReport.generated_at).toLocaleString()}</span>
                    </div>

                    {/* ── Pre-Test vs Post-Test Comparison ── */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>📊 Assessment Progress</span>
                        <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontStyle:'italic' }}>Pre-Test → Learning → Post-Test</span>
                      </div>
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                          <thead>
                            <tr style={{ borderBottom:'2px solid var(--border-color)' }}>
                              <th style={{ padding:'8px 10px', textAlign:'left', color:'var(--text-muted)', fontWeight:700 }}>Student</th>
                              <th style={{ padding:'8px 10px', textAlign:'center', color:'#38bdf8', fontWeight:700 }}>Quiz Avg</th>
                              <th style={{ padding:'8px 10px', textAlign:'center', color:'#a855f7', fontWeight:700 }}>Modules</th>
                              <th style={{ padding:'8px 10px', textAlign:'center', color:'#f59e0b', fontWeight:700 }}>Simulations</th>
                              <th style={{ padding:'8px 10px', textAlign:'left', color:'var(--text-muted)', fontWeight:700 }}>Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classReport.students.map(s => {
                              const quizPct = Math.round(s.quizzes.avg_percent)
                              const modPct  = Math.round(s.modules.percent)
                              const simPct  = Math.round(s.simulations.avg_percent)
                              const overallPct = Math.round((quizPct + modPct + simPct) / 3)
                              const barColor = overallPct >= 75 ? '#22c55e' : overallPct >= 50 ? '#f59e0b' : '#ef4444'
                              return (
                                <tr key={s.id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                                  <td style={{ padding:'8px 10px' }}>
                                    <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name}</div>
                                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s.email}</div>
                                  </td>
                                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                                    <span style={{ fontWeight:700, color: quizPct >= 75 ? '#22c55e' : quizPct >= 50 ? '#f59e0b' : '#ef4444' }}>{quizPct}%</span>
                                  </td>
                                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                                    <span style={{ fontWeight:700, color:'#a855f7' }}>{s.modules.completed}/{s.modules.total}</span>
                                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{modPct}%</div>
                                  </td>
                                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                                    <span style={{ fontWeight:700, color:'#f59e0b' }}>{simPct}%</span>
                                  </td>
                                  <td style={{ padding:'8px 10px', minWidth:120 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                      <div style={{ flex:1, height:8, borderRadius:999, background:'var(--border-color)', overflow:'hidden' }}>
                                        <div style={{ width:`${overallPct}%`, height:'100%', background:barColor, borderRadius:999, transition:'width 0.4s' }} />
                                      </div>
                                      <span style={{ fontSize:'0.72rem', fontWeight:700, color:barColor, minWidth:32 }}>{overallPct}%</span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ── Detailed Student Cards ── */}
                    <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>
                      Student Details
                    </div>
                    {classReport.students.map(s => {
                      const lastActive = s.last_login_at ? new Date(s.last_login_at).toLocaleString() : '—'
                      const needsAttention = s.modules.total > 0 && (s.modules.percent < 50 || !s.last_login_at || Date.now() - new Date(s.last_login_at).getTime() > 14*24*60*60*1000)
                      return (
                        <div key={s.id} className="rptListItem">
                          <div className="rptListAvatar">{s.name.charAt(0).toUpperCase()}</div>
                          <div className="rptListInfo">
                            <div className="rptListName">
                              {s.name}{needsAttention && <span className="tcDueBadge" style={{ marginLeft:6 }}><Icon name="warning" size={12} /> Needs attention</span>}
                            </div>
                            <div className="rptListMeta">{s.email} · Last active: {lastActive} · XP: {s.xp}</div>
                            <div className="rptListProgress">
                              <div className="rptListBar"><div className="rptListBarFill" style={{ width:`${s.modules.percent}%` }} /></div>
                              <div className="rptListPct">Modules {s.modules.completed}/{s.modules.total} ({s.modules.percent}%) · Quiz avg {s.quizzes.avg_percent}% · Sim avg {s.simulations.avg_percent}%</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          </main>

          {/* Bottom nav (mobile) */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/teacher/classrooms">
              <Icon name="school" size={20} />
              <span>Classes</span>
            </Link>
            <Link className="bottomNavItem" to="/teacher/reports" aria-current="page"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="bottomNavItem" to="/teacher/feedback"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
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

function buildFilterLabel(fromDate: string, toDate: string) {
  if (!fromDate && !toDate) return 'All time'
  if (fromDate && !toDate) return `From ${fromDate}`
  if (!fromDate && toDate) return `Up to ${toDate}`
  return `${fromDate} to ${toDate}`
}

function buildSummaryPrintHtml(summary: TeacherSummaryReport, fromDate: string, toDate: string) {
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
    <div class="meta">Generated at: ${escapeHtml(summary.generated_at)} · Range: ${escapeHtml(buildFilterLabel(fromDate, toDate))}</div>
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

function buildClassroomPrintHtml(report: TeacherClassroomReport, fromDate: string, toDate: string) {
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
    <div class="meta">Code: ${escapeHtml(report.classroom.code)} · Generated at: ${escapeHtml(report.generated_at)} · Range: ${escapeHtml(buildFilterLabel(fromDate, toDate))}</div>

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
