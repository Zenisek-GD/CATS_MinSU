import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getModules, type ApiTrainingModule } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'

// ─── Status helpers ──────────────────────────────────────────
type ModuleStatus = 'in_progress' | 'not_started' | 'completed'

function getStatus(m: ApiTrainingModule): ModuleStatus {
  if (!m.user_progress) return 'not_started'
  if (m.user_progress.is_completed) return 'completed'
  return 'in_progress'
}

function getProgress(m: ApiTrainingModule): number {
  if (!m.user_progress) return 0
  if (m.user_progress.is_completed) return 100
  const total = m.topics?.length || 1
  const idx = m.topics?.findIndex(t => t.id === m.user_progress?.last_topic_id) ?? -1
  return Math.min(Math.round(((idx + 1) / total) * 100), 99)
}

const STATUS_SORT: Record<ModuleStatus, number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
}

const STATUS_LABEL: Record<ModuleStatus, string> = {
  in_progress: 'In Progress',
  not_started: 'Not Started',
  completed: 'Completed',
}

function estReadMins(m: ApiTrainingModule): number {
  return Math.max(1, (m.topics?.length ?? 1) * 5)
}

function getOverallProgress(modules: ApiTrainingModule[]) {
  const total = modules.reduce((s, m) => s + (m.topics?.length || 0), 0)
  if (total === 0) return 0
  const done = modules.reduce((s, m) => {
    if (!m.user_progress) return s
    if (m.user_progress.is_completed) return s + (m.topics?.length || 0)
    const idx = m.topics?.findIndex(t => t.id === m.user_progress?.last_topic_id) ?? -1
    return s + (idx + 1)
  }, 0)
  return Math.round((done / total) * 100)
}

// Category keywords → pill label mapping (best-effort)
const CATEGORY_KEYWORDS: { label: string; keywords: string[] }[] = [
  { label: 'Phishing',     keywords: ['phish', 'email', 'scam', 'fraud'] },
  { label: 'Password',     keywords: ['password', 'credential', 'auth', 'login'] },
  { label: 'Cybercrime',   keywords: ['cybercrime', 'malware', 'ransomware', 'hacking', 'cyber'] },
  { label: 'Privacy',      keywords: ['privacy', 'data', 'personal', 'gdpr'] },
  { label: 'Social Eng.',  keywords: ['social', 'engineering', 'manipulation', 'pretexting'] },
]

function inferCategory(m: ApiTrainingModule): string | null {
  const text = `${m.title} ${m.description ?? ''}`.toLowerCase()
  for (const cat of CATEGORY_KEYWORDS) {
    if (cat.keywords.some(k => text.includes(k))) return cat.label
  }
  return null
}

// ─── Sub-components ──────────────────────────────────────────
function ProgressRow({ pct, status }: { pct: number; status: ModuleStatus }) {
  const color =
    status === 'completed' ? '#22c55e' :
    status === 'in_progress' ? '#38bdf8' : '#94a3b8'

  return (
    <div className="mProgressWrap">
      <div className="mProgressTrack">
        <div className="mProgressFill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mProgressPct" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: ModuleStatus }) {
  const cls =
    status === 'completed' ? 'mBadge mBadge--done' :
    status === 'in_progress' ? 'mBadge mBadge--prog' : 'mBadge mBadge--idle'
  return <span className={cls}>{STATUS_LABEL[status]}</span>
}

// ─── Main page ───────────────────────────────────────────────
export default function ModulesPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modules, setModules] = useState<ApiTrainingModule[]>([])
  const [query, setQuery] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setBusy(true); setError(null)
      try { const r = await getModules(); setModules(r.modules) }
      catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load modules.') }
      finally { setBusy(false) }
    })()
  }, [user])

  // Sorted: in-progress → not started → completed
  const sorted = useMemo(() =>
    [...modules].sort((a, b) => STATUS_SORT[getStatus(a)] - STATUS_SORT[getStatus(b)])
  , [modules])

  // Filter by search + category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter(m => {
      const textOk = !q ||
        (m.title || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q)
      const catOk = filterCat === 'All' || inferCategory(m) === filterCat
      return textOk && catOk
    })
  }, [sorted, query, filterCat])

  // "Up next" hero = first incomplete module
  const heroModule = useMemo(() =>
    filtered.find(m => getStatus(m) !== 'completed') ?? filtered[0]
  , [filtered])

  const restModules = useMemo(() =>
    filtered.filter(m => m.id !== heroModule?.id)
  , [filtered, heroModule])

  // Stats
  const overallPct     = getOverallProgress(modules)
  const completedCount = modules.filter(m => m.user_progress?.is_completed).length
  const remaining      = modules.length - completedCount

  if (!user) return null

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession(); navigate('/auth', { replace: true }) }
    catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  // Data-driven hero copy
  const heroCopy = completedCount === 0
    ? `${modules.length} modules ready — start your journey!`
    : completedCount === modules.length
    ? 'You\'ve completed all modules! Review them anytime.'
    : `${completedCount} of ${modules.length} modules done — ${remaining === 1 ? 'one more to go!' : `${remaining} more to go!`}`

  // Milestone nudge
  const milestoneNudge = overallPct >= 50 && remaining > 0
    ? `Complete ${remaining} more module${remaining > 1 ? 's' : ''} to finish your learning journey.`
    : null

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        {/* Sidebar */}
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
            <Link className="modulesNavItem active" to="/modules" aria-current="page"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="modulesNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="modulesNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="modulesNavItem" to="/classrooms"><Icon name="groups" size={20} /><span>Classrooms</span></Link>
            <Link className="modulesNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link className="modulesNavItem" to="/teacher/classrooms"><Icon name="manage_accounts" size={20} /><span>Teacher</span></Link>
            )}
            {user.role === 'admin' && (
              <Link className="modulesNavItem" to="/admin/dashboard"><Icon name="admin_panel_settings" size={20} /><span>Admin</span></Link>
            )}
          </nav>
          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} /><span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img src="/cats logo.png" alt="CATS Logo"
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }} />
                <div>
                  <div className="modulesTitle">MinSU CyberAware</div>
                  <div className="modulesSubtitle">{user.name || 'Student'}</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* ── Progress Hero ── */}
            <section className="modulesHero" aria-label="Overall progress">
              <div className="modulesHeroInner">
                <div style={{ flex: 1 }}>
                  <h1 className="modulesHeroTitle">Learning Journey</h1>
                  <p className="modulesHeroText">{heroCopy}</p>
                </div>
                <div className="modulesOverall">
                  <div className="modulesOverallRow">
                    <span className="modulesOverallLabel">Overall Progress</span>
                    <span className="modulesOverallValue">{overallPct}%</span>
                  </div>
                  <div className="modulesOverallBar" role="progressbar"
                    aria-valuenow={overallPct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="modulesOverallBarInner" style={{ width: `${overallPct}%` }} />
                  </div>
                  {milestoneNudge && (
                    <div className="mMilestoneNudge">
                      <Icon name="emoji_events" size={14} /> {milestoneNudge}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Search + Category Filters ── */}
            <div className="mControlsRow" aria-label="Search and filter">
              {/* Inline search */}
              <div className="mSearchWrap">
                <Icon name="search" size={17} />
                <input
                  type="text"
                  className="mSearchInput"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search modules…"
                  aria-label="Search modules"
                />
                {query && (
                  <button type="button" className="mSearchClear" onClick={() => setQuery('')} aria-label="Clear search">
                    <Icon name="close" size={15} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="mCatPills" role="group" aria-label="Filter by category">
                {['All', ...CATEGORY_KEYWORDS.map(c => c.label)].map(cat => (
                  <button key={cat}
                    className={`mCatPill ${filterCat === cat ? 'active' : ''}`}
                    onClick={() => setFilterCat(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {error && <div className="modulesError">{error}</div>}
            {busy && modules.length === 0 && <div className="modulesLoading">Loading modules…</div>}
            {!busy && filtered.length === 0 && <div className="modulesEmpty">No modules match.</div>}

            {/* ── "Up Next" Hero Card ── */}
            {heroModule && (() => {
              const status  = getStatus(heroModule)
              const pct     = getProgress(heroModule)
              const mins    = estReadMins(heroModule)
              const cta     = status === 'completed' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start Learning'
              return (
                <section className="mUpNextWrap" aria-label="Up next module">
                  <div className="mUpNextLabel">
                    <Icon name="play_circle" size={14} />
                    {status === 'completed' ? 'Recently Completed' : 'Up Next'}
                  </div>
                  <article className="mUpNextCard">
                    <div className="mUpNextLeft">
                      <div className="mUpNextIconWrap">
                        <Icon name="school" size={28} />
                      </div>
                    </div>
                    <div className="mUpNextBody">
                      <div className="mUpNextTop">
                        <div>
                          <h2 className="mUpNextTitle">{heroModule.title}</h2>
                          <StatusBadge status={status} />
                        </div>
                        <div className="mUpNextMeta">
                          <span><Icon name="timer" size={13} /> ~{mins} min</span>
                          <span><Icon name="menu_book" size={13} /> {heroModule.topics?.length ?? 0} topics</span>
                        </div>
                      </div>
                      {heroModule.description && (
                        <p className="mUpNextDesc">{heroModule.description}</p>
                      )}
                      <ProgressRow pct={pct} status={status} />
                      <div className="mUpNextFooter">
                        <div className="mEnrollRow" aria-label="Classmates enrolled">
                          <div className="mBubble">JD</div>
                          <div className="mBubble mBubble--teal">MS</div>
                          <div className="mBubble">+12</div>
                          <span className="mEnrollLabel">classmates enrolled</span>
                        </div>
                        <Link to={`/modules/${heroModule.id}`} className="mCtaBtn mCtaBtn--primary">
                          {cta} <Icon name="arrow_forward" size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                </section>
              )
            })()}

            {/* ── Module Grid ── */}
            {restModules.length > 0 && (
              <section className="mGrid" aria-label="All modules">
                {restModules.map(m => {
                  const status = getStatus(m)
                  const pct    = getProgress(m)
                  const mins   = estReadMins(m)
                  const cta    = status === 'in_progress' ? 'Continue' : status === 'completed' ? 'Review' : 'Start'
                  return (
                    <article key={m.id} className={`mCard mCard--${status}`}>
                      <div className="mCardTop">
                        <div className="mCardIcon">
                          <Icon name={
                            status === 'completed' ? 'check_circle' :
                            status === 'in_progress' ? 'play_circle' : 'school'
                          } size={20} />
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <h3 className="mCardTitle">{m.title}</h3>
                      {m.description && <p className="mCardDesc">{m.description}</p>}

                      <div className="mCardMeta">
                        <span className="mMetaItem"><Icon name="timer" size={13} /> ~{mins} min</span>
                        <span className="mMetaItem"><Icon name="menu_book" size={13} /> {m.topics?.length ?? 0} topics</span>
                      </div>

                      <ProgressRow pct={pct} status={status} />

                      <Link to={`/modules/${m.id}`} className={`mCtaBtn mCtaBtn--${status === 'completed' ? 'review' : 'default'}`}>
                        {cta} <Icon name="arrow_forward" size={13} />
                      </Link>
                    </article>
                  )
                })}
              </section>
            )}
          </main>

          {/* Bottom Nav */}
          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem active" to="/modules" aria-current="page"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="bottomNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="bottomNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="bottomNavItem" to="/classrooms"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
