import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getQuizzes, startQuizAttempt, type ApiQuiz } from '../api/quizzes'
import { getApiErrorMessage } from '../api/error'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import './ModulesPage.css'

type QuizUi = ApiQuiz & {
  categoryLabel: string
  metaLabel: string
}

function fmtSeconds(seconds: number | null) {
  if (!seconds) return 'No time limit'
  const mins = Math.round(seconds / 60)
  if (mins <= 1) return '1 min'
  return `${mins} mins`
}

export default function QuizzesPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([])
  const [startingQuizId, setStartingQuizId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getQuizzes()
        setQuizzes(resp.quizzes)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load quizzes.'))
      } finally {
        setBusy(false)
      }
    })()
  }, [user])

  const items = useMemo<QuizUi[]>(() => {
    return quizzes.map((q) => {
      const categoryLabel = q.category?.name || 'General'
      const metaLabel = `${q.kind.toUpperCase()} • ${q.difficulty.toUpperCase()} • ${q.question_count} Q • ${fmtSeconds(q.time_limit_seconds)}`
      return { ...q, categoryLabel, metaLabel }
    })
  }, [quizzes])

  if (!user) return null

  async function onLogout() {
    setLoggingOut(true)
    try {
      await clearSession()
      navigate('/auth', { replace: true })
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }

  async function onStart(quizId: number) {
    setStartingQuizId(quizId)
    setError(null)
    try {
      const resp = await startQuizAttempt(quizId)
      navigate(`/quiz-attempts/${resp.attempt.id}`)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to start quiz.'))
    } finally {
      setStartingQuizId(null)
    }
  }

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <img 
              src="/cats logo.png" 
              alt="CATS Logo" 
              className="modulesLogo"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '12px' }}
            />
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem active" to="/quizzes" aria-current="page">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <Icon name="person" size={20} />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="modulesSidebarBottom">
            <button type="button" className="sidebarLogoutBtn" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={20} />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <img 
                  src="/cats logo.png" 
                  alt="CATS Logo" 
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px' }}
                />
                <div>
                  <div className="modulesTitle">Assessments</div>
                  <div className="modulesSubtitle">Choose a quiz to begin</div>
                </div>
              </div>

              <TopbarActions hideLogout />
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Assessments hero">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Assess Your Knowledge</h1>
                  <p className="modulesHeroText">
                    Take short quizzes to measure your cyber awareness and see feedback after you submit.
                  </p>
                </div>
              </div>
            </section>

            {error ? <div className="modulesError">{error}</div> : null}

            <section className="modulesGrid" aria-label="Available quizzes">
              {busy && quizzes.length === 0 ? <div className="modulesLoading">Loading quizzes…</div> : null}

              {items.length === 0 && !busy ? <div className="modulesEmpty">No quizzes available.</div> : null}

              {items.map((q) => {
                const isStarting = startingQuizId === q.id

                return (
                  <article key={q.id} className="moduleCard">
                    <div className="moduleBody compact">
                      <div className="moduleIcon" aria-hidden="true">
                        <Icon name="quiz" size={24} />
                      </div>

                      <div className="moduleHeader">
                        <h2 className="moduleTitle">{q.title}</h2>
                        <span className="moduleStatus">{q.categoryLabel}</span>
                      </div>

                      <p className="moduleDesc">{q.description || q.metaLabel}</p>

                      <div className="moduleMeta">
                        <div className="moduleMetaRow">
                          <span>Details</span>
                          <span className="inProgress">{q.metaLabel}</span>
                        </div>

                        <button
                          type="button"
                          className="moduleCta"
                          onClick={() => onStart(q.id)}
                          disabled={!!startingQuizId}
                          aria-disabled={!!startingQuizId}
                        >
                          {isStarting ? 'Starting…' : 'Start Quiz'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem active" to="/quizzes" aria-current="page">
              <Icon name="quiz" size={20} />
              <span>Assess</span>
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
