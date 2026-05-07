import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getQuizzes, startQuizAttempt, getMyQuizAttempts,
  type ApiQuiz, type AttemptSummary,
} from '../api/quizzes'
import { getApiErrorMessage } from '../api/error'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'
import './QuizzesPage.css'

// ─── helpers ────────────────────────────────────────────────
function fmtTime(s: number | null): string {
  if (!s) return 'No limit'
  const m = Math.round(s / 60)
  return m <= 1 ? '1 min' : `${m} mins`
}

const DIFF_COLOR: Record<string, string> = {
  easy:   '#22c55e',
  medium: '#f59e0b',
  hard:   '#ef4444',
}

type Variant = 'pretest' | 'regular' | 'posttest'
const VAR_ACCENT: Record<Variant, string> = {
  pretest:  '#38bdf8',
  regular:  '#a855f7',
  posttest: '#22c55e',
}

// ─── sub-components ─────────────────────────────────────────
function DiffPill({ diff }: { diff: string }) {
  const color = DIFF_COLOR[diff] ?? '#94a3b8'
  return (
    <span className="qzDiffPill" style={{ background: `${color}22`, color }}>
      {diff}
    </span>
  )
}

function ScoreBadge({ a, max }: { a: AttemptSummary; max: number }) {
  const pct = Math.round(a.percent)
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="qzScoreBadge" style={{ borderColor: color }}>
      <Icon name="check_circle" size={14} style={{ color }} />
      <span style={{ color }}>{pct}%</span>
      <span className="qzScoreSub">{a.score}/{max} pts</span>
    </div>
  )
}

interface CardProps {
  quiz: ApiQuiz
  variant: Variant
  attempt: AttemptSummary | null
  locked: boolean
  starting: boolean
  onStart: (id: number) => void
}

function QuizCard({ quiz, variant, attempt, locked, starting, onStart }: CardProps) {
  const accent = VAR_ACCENT[variant]
  const isComplete = !!attempt

  return (
    <article className={`qzCard qzCard--${variant} ${locked ? 'qzCard--locked' : ''}`}
      aria-label={`${quiz.title}${locked ? ' (locked)' : ''}`}>
      {locked && (
        <div className="qzLockOverlay">
          <Icon name="lock_open" size={22} />
          <span>Complete the previous step first</span>
        </div>
      )}

      <div className="qzCardIconWrap" style={{ background: `${accent}18`, color: accent }}>
        <Icon name={variant === 'pretest' ? 'assignment' : variant === 'posttest' ? 'verified' : 'quiz'} size={22} />
      </div>

      <div className="qzCardBody">
        <div className="qzCardTop">
          <h3 className="qzCardTitle">{quiz.title}</h3>
          {isComplete && <ScoreBadge a={attempt!} max={quiz.question_count} />}
        </div>

        {quiz.description && (
          <p className="qzCardDesc">{quiz.description}</p>
        )}

        {/* Meta row */}
        <div className="qzCardMeta">
          <DiffPill diff={quiz.difficulty} />
          <span className="qzMetaItem">
            <Icon name="help_outline" size={13} /> {quiz.question_count} Q
          </span>
          <span className="qzMetaItem">
            <Icon name="timer" size={13} /> {fmtTime(quiz.time_limit_seconds)}
          </span>
        </div>

        {/* Last score history */}
        {isComplete && (
          <div className="qzLastScore">
            <Icon name="history" size={13} />
            Last score: {attempt!.score}/{attempt!.max_score} &nbsp;·&nbsp;
            {new Date(attempt!.finished_at ?? '').toLocaleDateString()}
          </div>
        )}

        {/* CTA */}
        {!locked && (
          <div className="qzCardActions">
            {isComplete ? (
              <>
                <span className="qzDoneLabel">
                  <Icon name="check_circle" size={15} /> Completed
                </span>
                <button
                  type="button"
                  className={`qzBtn qzBtn--retake qzBtn--${variant}`}
                  onClick={() => onStart(quiz.id)}
                  disabled={starting}
                >
                  {starting ? 'Starting…' : 'Retake'}
                  <Icon name="refresh" size={14} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`qzBtn qzBtn--${variant}`}
                onClick={() => onStart(quiz.id)}
                disabled={starting}
              >
                {starting ? 'Starting…' : variant === 'pretest' ? 'Take Pre-Test' : variant === 'posttest' ? 'Take Post-Test' : 'Start Quiz'}
                <Icon name="arrow_forward" size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function SectionBlock({
  icon, title, subtitle, variant, stepNum, locked, quizzes, attempts, startingId, onStart,
}: {
  icon: string; title: string; subtitle: string; variant: Variant; stepNum: number
  locked: boolean; quizzes: ApiQuiz[]; attempts: Record<string, AttemptSummary>
  startingId: number | null; onStart: (id: number) => void
}) {
  const accent = VAR_ACCENT[variant]
  return (
    <section className={`qzSection ${locked ? 'qzSection--locked' : ''}`} aria-label={title}>
      <div className="qzSectionHeader" style={{ borderColor: `${accent}30`, background: `${accent}08` }}>
        <div className="qzSectionIconWrap" style={{ background: `${accent}18`, color: accent }}>
          <Icon name={icon} size={20} />
        </div>
        <div className="qzSectionText">
          <div className="qzSectionStep">Step {stepNum}</div>
          <h2 className="qzSectionTitle" style={{ color: accent }}>{title}</h2>
          <p className="qzSectionSub">{subtitle}</p>
        </div>
        {locked && (
          <div className="qzSectionLockBadge">
            <Icon name="lock_open" size={14} /> Locked
          </div>
        )}
      </div>
      <div className="qzGrid">
        {quizzes.map(q => (
          <QuizCard
            key={q.id}
            quiz={q}
            variant={variant}
            attempt={attempts[String(q.id)] ?? null}
            locked={locked}
            starting={startingId === q.id}
            onStart={onStart}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function QuizzesPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([])
  const [attempts, setAttempts] = useState<Record<string, AttemptSummary>>({})
  const [startingId, setStartingId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setBusy(true); setError(null)
      try {
        const [qr, ar] = await Promise.all([getQuizzes(), getMyQuizAttempts()])
        setQuizzes(qr.quizzes)
        setAttempts(ar)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load assessments.'))
      } finally {
        setBusy(false)
      }
    })()
  }, [user])

  const { pretests, regulars, posttests } = useMemo(() => ({
    pretests:  quizzes.filter(q => q.kind === 'pretest'),
    regulars:  quizzes.filter(q => q.kind === 'regular'),
    posttests: quizzes.filter(q => q.kind === 'posttest'),
  }), [quizzes])

  // Step completion logic
  const pretestDone  = pretests.length  === 0 || pretests.every(q  => !!attempts[String(q.id)])
  const regularsDone = regulars.length  === 0 || regulars.every(q  => !!attempts[String(q.id)])

  // Progress strip
  const totalSteps = [pretests, regulars, posttests].filter(g => g.length > 0).length
  const doneSteps  = [
    pretests.length  > 0 && pretestDone,
    regulars.length  > 0 && regularsDone,
    posttests.length > 0 && posttests.every(q => !!attempts[String(q.id)]),
  ].filter(Boolean).length
  const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  if (!user) return null

  async function onLogout() {
    setLoggingOut(true)
    try { await clearSession(); navigate('/auth', { replace: true }) }
    catch { /* ignore */ } finally { setLoggingOut(false) }
  }

  async function onStart(quizId: number) {
    setStartingId(quizId); setError(null)
    try {
      const resp = await startQuizAttempt(quizId)
      navigate(`/quiz-attempts/${resp.attempt.id}`)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to start quiz.'))
    } finally { setStartingId(null) }
  }

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
            <Link className="modulesNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="modulesNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="modulesNavItem active" to="/quizzes" aria-current="page"><Icon name="quiz" size={20} /><span>Assess</span></Link>
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
                  <div className="modulesTitle">Assessments</div>
                  <div className="modulesSubtitle">Your learning journey</div>
                </div>
              </div>
              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            {/* ── Progress Header Strip ── */}
            <div className="qzProgressStrip" role="status" aria-label="Overall progress">
              <div className="qzProgressLeft">
                <div className="qzProgressLabel">
                  <Icon name="insights" size={16} />
                  <strong>{doneSteps} of {totalSteps}</strong> steps completed
                </div>
                <div className="qzProgressTrack">
                  <div
                    className="qzProgressFill"
                    style={{ width: `${progressPct}%` }}
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
              <div className="qzProgressPct">{progressPct}%</div>
            </div>

            {/* Journey Steps indicator */}
            <div className="qzJourney" aria-label="Learning journey steps">
              {[
                { label: 'Pre-Test', icon: 'assignment', done: pretestDone, color: '#38bdf8', show: pretests.length > 0 },
                { label: 'Learn & Simulate', icon: 'school', done: pretestDone, color: '#a855f7', show: true },
                { label: 'Post-Test', icon: 'verified', done: posttests.every(q => !!attempts[String(q.id)]), color: '#22c55e', show: posttests.length > 0 },
              ].filter(s => s.show).map((s, i, arr) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={`qzJourneyStep ${s.done ? 'qzJourneyStep--done' : ''}`} style={{ '--step-color': s.color } as React.CSSProperties}>
                    {s.done ? <Icon name="check_circle" size={16} /> : <Icon name={s.icon} size={16} />}
                    <span>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="qzJourneyArrow"><Icon name="arrow_forward" size={14} /></div>}
                </div>
              ))}
            </div>

            {error && <div className="modulesError">{error}</div>}
            {busy && <div className="modulesLoading">Loading assessments…</div>}

            {/* Step 1: Pre-Tests */}
            {pretests.length > 0 && (
              <SectionBlock
                icon="assignment" title="Pre-Test" stepNum={1} variant="pretest"
                subtitle="Take this BEFORE learning to establish your baseline knowledge."
                locked={false}
                quizzes={pretests} attempts={attempts} startingId={startingId} onStart={onStart}
              />
            )}

            {/* Step 2: Practice */}
            {regulars.length > 0 && (
              <SectionBlock
                icon="quiz" title="Practice Quizzes" stepNum={2} variant="regular"
                subtitle="Sharpen your cyber awareness anytime — no prerequisites required."
                locked={false}
                quizzes={regulars} attempts={attempts} startingId={startingId} onStart={onStart}
              />
            )}

            {/* Step 3: Post-Tests — locked until pre-test done */}
            {posttests.length > 0 && (
              <SectionBlock
                icon="verified" title="Post-Test" stepNum={3} variant="posttest"
                subtitle="Complete the Pre-Test first, then take this to measure your improvement."
                locked={!pretestDone}
                quizzes={posttests} attempts={attempts} startingId={startingId} onStart={onStart}
              />
            )}

            {!busy && quizzes.length === 0 && (
              <div className="modulesEmpty">No assessments available yet.</div>
            )}
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules"><Icon name="school" size={20} /><span>Learn</span></Link>
            <Link className="bottomNavItem" to="/simulations"><Icon name="security" size={20} /><span>Simulate</span></Link>
            <Link className="bottomNavItem active" to="/quizzes" aria-current="page"><Icon name="quiz" size={20} /><span>Assess</span></Link>
            <Link className="bottomNavItem" to="/classrooms"><Icon name="groups" size={20} /><span>Classes</span></Link>
            <Link className="bottomNavItem" to="/profile"><Icon name="person" size={20} /><span>Profile</span></Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
