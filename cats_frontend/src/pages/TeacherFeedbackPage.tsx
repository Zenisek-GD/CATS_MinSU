import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './TeacherDashboardPage.css'

// ─── Types ───────────────────────────────────────────────────────────────────
interface FeedbackItem {
  id: number
  user: { id: number; name: string; email: string; participant_code: string | null }
  feedback_type: string
  usability_score: number | null
  relevance_score: number | null
  practicality_score: number | null
  engagement_score: number | null
  comment: string | null
  perceived_difficulty: string | null
  would_recommend: boolean
  status: string
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  quiz: 'Quiz', simulation: 'Simulation', module: 'Module',
  general: 'General', system: 'System',
}

const STATUS_COLOR: Record<string, string> = {
  pending:  '#94a3b8',
  reviewed: '#38bdf8',
  flagged:  '#f59e0b',
  resolved: '#22c55e',
  archived: '#64748b',
}

function avgScore(scores: (number | null)[]) {
  const valid = scores.filter((s): s is number => s !== null)
  return valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : '—'
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherFeedbackPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  // Classrooms dropdown
  const [classrooms, setClassrooms] = useState<{ id: number; name: string }[]>([])
  const [classroomId, setClassroomId] = useState<string>('all')

  const [feedback, setFeedback]   = useState<FeedbackItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [selected, setSelected]   = useState<FeedbackItem | null>(null)

  const [filterType,   setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage]                 = useState(1)
  const [totalPages, setTotalPages]     = useState(1)

  const token = localStorage.getItem('cats_token')

  useEffect(() => {
    if (!user) return
    fetchFeedback()
  }, [classroomId, filterType, filterStatus, page, user])

  async function fetchFeedback() {
    setLoading(true); setError(null)
    try {
      let url = `/api/teacher/feedback?page=${page}&per_page=50`
      if (classroomId !== 'all') url += `&classroom_id=${classroomId}`
      if (filterType   !== 'all') url += `&feedback_type=${filterType}`
      if (filterStatus !== 'all') url += `&status=${filterStatus}`

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()

      // New response shape: { classrooms: [...], feedback: { data: [...], last_page: N } }
      if (data.classrooms) setClassrooms(data.classrooms)

      const fb = data.feedback ?? data
      if (fb.data && Array.isArray(fb.data)) {
        setFeedback(fb.data); setTotalPages(fb.last_page || 1)
      } else if (Array.isArray(fb)) {
        setFeedback(fb); setTotalPages(1)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession(); navigate('/auth', { replace: true }) }
    catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  if (!user) return null

  return (
    <div className="modulesPage">
      <div className="modulesShell">

        {/* ── Sidebar ── */}
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img src="/cats logo.png" alt="CATS Logo"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '12px' }} />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/teacher/classrooms"><Icon name="groups" size={20} /><span>Classrooms</span></Link>
            <Link className="modulesNavItem" to="/teacher/reports"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="modulesNavItem" to="/teacher/resources"><Icon name="video_library" size={20} /><span>Resources</span></Link>
            <Link className="modulesNavItem active" to="/teacher/feedback" aria-current="page"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="modulesNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
          <div className="modulesSidebarBottom">
            <button className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} /><span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          {/* ── Topbar ── */}
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img src="/cats logo.png" alt="CATS Logo"
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }} />
                <div>
                  <div className="modulesTitle">Student Feedback</div>
                  <div className="modulesSubtitle">
                    {classroomId === 'all'
                      ? 'All your classrooms'
                      : classrooms.find(c => String(c.id) === classroomId)?.name ?? 'Classroom'}
                  </div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* ── Filter row ── */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>

              {/* Classroom selector — primary filter */}
              <div className="tcField" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>CLASSROOM</label>
                <select value={classroomId} onChange={e => { setClassroomId(e.target.value); setPage(1) }}
                  style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--accent)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', fontWeight: 600 }}>
                  <option value="all">All Classrooms</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="tcField" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>TYPE</label>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
                  style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="simulation">Simulation</option>
                  <option value="module">Module</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="tcField" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>STATUS</label>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
                  style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="flagged">Flagged</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {error && <div className="modulesError">{error}</div>}
            {loading && <div className="modulesLoading">Loading feedback…</div>}

            {!loading && feedback.length === 0 && (
              <div className="tcEmpty">
                <Icon name="feedback" size={40} />
                <p>No feedback found from your students.</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Students submit feedback after completing quizzes, simulations, or modules.
                </p>
              </div>
            )}

            {/* ── Cards ── */}
            {!loading && feedback.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feedback.map(item => {
                  const avg = avgScore([item.usability_score, item.relevance_score, item.practicality_score, item.engagement_score])
                  const statusColor = STATUS_COLOR[item.status] ?? '#94a3b8'
                  return (
                    <div key={item.id} className="rptListItem"
                      style={{ cursor: 'pointer' }} onClick={() => setSelected(item)}>
                      <div className="rptListAvatar">
                        {(item.user?.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="rptListInfo">
                        <div className="rptListName">{item.user?.name || 'Unknown'}</div>
                        <div className="rptListMeta">
                          {item.user?.email} &middot; {TYPE_LABELS[item.feedback_type] || item.feedback_type}
                          &middot; {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        {item.comment && (
                          <div style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-secondary)',
                            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                            "{item.comment}"
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Space Grotesk, sans-serif' }}>
                          ★ {avg}/5
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                          background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                <button className="moduleCta" onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>← Prev</button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="moduleCta" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Next →</button>
              </div>
            )}
          </main>

          {/* ── Bottom Nav ── */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/teacher/classrooms"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/teacher/reports"><Icon name="assessment" size={20} /><span>Reports</span></Link>
            <Link className="bottomNavItem active" to="/teacher/feedback" aria-current="page"><Icon name="feedback" size={20} /><span>Feedback</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="tcModal" onClick={() => setSelected(null)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>Feedback Detail</h2>
              <button className="tcModalClose" onClick={() => setSelected(null)}><Icon name="close" size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="tcField" style={{ margin: 0 }}>
                <label>Student</label>
                <div style={{ padding: '8px 12px', background: 'var(--page-bg)', borderRadius: 8, fontSize: '0.9rem' }}>
                  {selected.user?.name} &middot; {selected.user?.email}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Type', TYPE_LABELS[selected.feedback_type] || selected.feedback_type],
                  ['Status', selected.status],
                  ['Difficulty', selected.perceived_difficulty?.replace(/_/g, ' ') || '—'],
                  ['Recommend', selected.would_recommend ? '✅ Yes' : '❌ No'],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="tcField" style={{ margin: 0 }}>
                    <label>{lbl}</label>
                    <div style={{ padding: '7px 10px', background: 'var(--page-bg)', borderRadius: 8, fontSize: '0.86rem', textTransform: 'capitalize' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Score bars */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Scores (out of 5)</label>
                {[
                  ['Usability',    selected.usability_score],
                  ['Relevance',    selected.relevance_score],
                  ['Practicality', selected.practicality_score],
                  ['Engagement',   selected.engagement_score],
                ].map(([lbl, val]) => (
                  <div key={String(lbl)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: 88, flexShrink: 0 }}>{lbl}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${((Number(val) || 0) / 5) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', minWidth: 24 }}>{val ?? '—'}</span>
                  </div>
                ))}
              </div>

              {selected.comment && (
                <div className="tcField" style={{ margin: 0 }}>
                  <label>Comment</label>
                  <div style={{ padding: '10px 12px', background: 'var(--page-bg)', borderRadius: 8, fontSize: '0.86rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selected.comment}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="moduleCta" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
