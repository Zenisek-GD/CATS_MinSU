import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import {
  getSimulations, startSimulationRun,
  type ApiSimulation, type SimRunSummary,
} from '../api/simulations'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './SimulationsPage.css'

function fmtSeconds(s: number | null) {
  if (!s) return 'No limit'
  const m = Math.round(s / 60)
  return m <= 1 ? '1 min' : `${m} mins`
}

async function fetchMyRuns(): Promise<Record<string, SimRunSummary>> {
  const r = await api.get('/api/my-simulation-runs')
  return (r.data as { runs: Record<string, SimRunSummary> }).runs
}

const DIFF_COLOR: Record<string, string> = {
  easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
}

const CAT_ICON: Record<string, string> = {
  phishing: 'mail', 'online-scams': 'smartphone', scams: 'smartphone',
  'social-engineering': 'group', 'data-privacy': 'policy',
  password: 'vpn_key', malware: 'bug_report', default: 'security',
}

function catIcon(slug?: string | null) {
  if (!slug) return CAT_ICON.default
  for (const [k, v] of Object.entries(CAT_ICON)) {
    if (slug.toLowerCase().includes(k)) return v
  }
  return CAT_ICON.default
}

function DiffPill({ diff }: { diff: string }) {
  const c = DIFF_COLOR[diff] ?? '#94a3b8'
  return <span className="simDiffPill" style={{ background: `${c}22`, color: c }}>{diff}</span>
}

interface SimCardProps {
  sim: ApiSimulation; run: SimRunSummary | null; starting: boolean; onStart: (id: number) => void
}

function SimCard({ sim, run, starting, onStart }: SimCardProps) {
  const icon = catIcon(sim.category?.slug)
  const isComplete = !!run
  const pct = run ? Math.round(run.percent) : null
  const scoreColor = pct !== null ? (pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444') : '#38bdf8'
  return (
    <article className="simCard" aria-label={sim.title}>
      <div className="simCardInner">
        <div className="simCardIcon" style={{ background: '#38bdf820', color: '#38bdf8' }}>
          <Icon name={icon} size={22} />
        </div>
        <div className="simCardBody">
          <h3 className="simCardTitle">{sim.title}</h3>
          {sim.category && <span className="simCatBadge">{sim.category.name}</span>}
          {sim.description && <p className="simCardDesc">{sim.description}</p>}
          <div className="simCardMeta">
            <DiffPill diff={sim.difficulty} />
            <span className="simMetaItem"><Icon name="timer" size={13} /> {fmtSeconds(sim.time_limit_seconds)}</span>
            <span className="simMetaItem"><Icon name="star" size={13} /> {sim.max_score} pts</span>
          </div>
          {isComplete && (
            <div className="simBestScore" style={{ borderColor: `${scoreColor}40`, color: scoreColor }}>
              <Icon name="emoji_events" size={14} />
              Your best: {run!.score} / {run!.max_score} pts · {pct}%
            </div>
          )}
          <div className="simCardActions">
            {isComplete ? (
              <>
                <span className="simDoneLabel"><Icon name="check_circle" size={14} /> Completed</span>
                <button type="button" className="simBtn simBtn--replay" onClick={() => onStart(sim.id)} disabled={starting}>
                  {starting ? 'Starting…' : 'Replay'}<Icon name="refresh" size={13} />
                </button>
              </>
            ) : (
              <button type="button" className="simBtn simBtn--start" onClick={() => onStart(sim.id)} disabled={starting}>
                {starting ? 'Starting…' : 'Start Simulation'}<Icon name="play_arrow" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ComingSoonCard() {
  return (
    <article className="simCard simCard--placeholder" aria-label="Coming Soon">
      <div className="simCardInner">
        <div className="simCardIcon" style={{ background: '#94a3b815', color: '#94a3b8' }}>
          <Icon name="add" size={22} />
        </div>
        <div className="simCardBody">
          <h3 className="simCardTitle" style={{ color: 'var(--text-muted)' }}>More Coming Soon</h3>
          <p className="simCardDesc" style={{ color: 'var(--text-muted)' }}>New scenarios in development. Check back soon!</p>
        </div>
      </div>
    </article>
  )
}

const DIFF_ORDER = ['easy', 'medium', 'hard']

export default function SimulationsPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ApiSimulation[]>([])
  const [runs, setRuns] = useState<Record<string, SimRunSummary>>({})
  const [startingId, setStartingId] = useState<number | null>(null)
  const [filterCat, setFilterCat] = useState('all')
  const [filterDiff, setFilterDiff] = useState('all')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setBusy(true); setError(null)
      try {
        const [sr, rr] = await Promise.all([getSimulations(), fetchMyRuns()])
        setItems(sr.simulations); setRuns(rr)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load simulations.'))
      } finally { setBusy(false) }
    })()
  }, [user])

  const categories = useMemo(() => {
    const seen = new Map<string, string>()
    items.forEach(s => { if (s.category) seen.set(s.category.slug, s.category.name) })
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }))
  }, [items])

  const filtered = useMemo(() => items.filter(s => {
    const catOk  = filterCat  === 'all' || s.category?.slug === filterCat
    const diffOk = filterDiff === 'all' || s.difficulty === filterDiff
    return catOk && diffOk
  }), [items, filterCat, filterDiff])

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; slug: string; sims: ApiSimulation[] }>()
    filtered.forEach(s => {
      const key = s.category?.slug ?? 'general'
      if (!map.has(key)) map.set(key, { label: s.category?.name ?? 'General', slug: key, sims: [] })
      map.get(key)!.sims.push(s)
    })
    map.forEach(g => g.sims.sort((a, b) => DIFF_ORDER.indexOf(a.difficulty) - DIFF_ORDER.indexOf(b.difficulty)))
    return Array.from(map.values())
  }, [filtered])

  const totalTime = useMemo(() => items.reduce((a, s) => a + (s.time_limit_seconds ?? 0), 0), [items])
  const completedCount = items.filter(s => !!runs[String(s.id)]).length

  if (!user) return null

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession(); navigate('/auth', { replace: true }) }
    catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  async function onStart(simId: number) {
    setStartingId(simId); setError(null)
    try {
      const resp = await startSimulationRun(simId)
      navigate(`/simulation-runs/${resp.run.id}`)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to start simulation.'))
    } finally { setStartingId(null) }
  }

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img src="/cats logo.png" alt="CATS Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '12px' }} />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>
          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="modulesNavItem active" to="/simulations" aria-current="page"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="modulesNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
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
                <img src="/cats logo.png" alt="CATS Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }} />
                <div>
                  <div className="modulesTitle">Simulations</div>
                  <div className="modulesSubtitle">Practice with realistic cyber attack scenarios</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            <section className="simHero" aria-label="Overview">
              <h1 className="modulesHeroTitle">Simulate Real Attacks (Safely)</h1>
              <p className="modulesHeroText">Make decisions in realistic cyberthreat scenarios — learn from every outcome.</p>
              {items.length > 0 && (
                <div className="simHeroMeta">
                  <span><Icon name="security" size={14} /> {items.length} simulations</span>
                  {totalTime > 0 && <span><Icon name="timer" size={14} /> ~{Math.round(totalTime / 60)} mins total</span>}
                  <span><Icon name="check_circle" size={14} /> {completedCount} / {items.length} completed</span>
                </div>
              )}
            </section>

            {items.length > 0 && (
              <div className="simFilterBar" role="group" aria-label="Filter simulations">
                <div className="simFilterGroup">
                  <button className={`simFilterPill ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>All</button>
                  {categories.map(c => (
                    <button key={c.slug} className={`simFilterPill ${filterCat === c.slug ? 'active' : ''}`} onClick={() => setFilterCat(c.slug)}>{c.name}</button>
                  ))}
                </div>
                <div className="simFilterGroup">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                    <button key={d}
                      className={`simFilterPill simFilterPill--diff ${filterDiff === d ? 'active' : ''}`}
                      style={filterDiff === d && d !== 'all' ? { background: `${DIFF_COLOR[d]}22`, color: DIFF_COLOR[d], borderColor: DIFF_COLOR[d] } : {}}
                      onClick={() => setFilterDiff(d)}
                    >{d === 'all' ? 'Any difficulty' : d.charAt(0).toUpperCase() + d.slice(1)}</button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="modulesError">{error}</div>}
            {busy && items.length === 0 && <div className="modulesLoading">Loading simulations…</div>}
            {!busy && filtered.length === 0 && items.length > 0 && <div className="modulesEmpty">No simulations match the selected filters.</div>}

            {grouped.map(group => (
              <section key={group.label} className="simGroup" aria-label={group.label}>
                <div className="simGroupHeader">
                  <div className="simGroupIcon"><Icon name={catIcon(group.slug)} size={18} /></div>
                  <h2 className="simGroupTitle">{group.label}</h2>
                  <span className="simGroupCount">{group.sims.length}</span>
                </div>
                <div className="simGrid">
                  {group.sims.map(s => (
                    <SimCard key={s.id} sim={s} run={runs[String(s.id)] ?? null} starting={startingId === s.id} onStart={onStart} />
                  ))}
                  {group.sims.length % 2 !== 0 && <ComingSoonCard />}
                </div>
              </section>
            ))}

            {!busy && items.length === 0 && <div className="modulesEmpty">No simulations available yet.</div>}
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="bottomNavItem active" to="/simulations" aria-current="page"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="bottomNavItem" to="/quizzes"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="bottomNavItem" to="/classrooms"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
