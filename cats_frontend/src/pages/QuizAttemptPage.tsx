import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getQuizAttempt,
  submitQuizAttempt,
  type ApiQuizAttempt,
  type ApiQuizAttemptFeedback,
  type ApiQuizAttemptResult,
} from '../api/quizzes'
import { getApiErrorMessage } from '../api/error'
import { useAuth } from '../auth/AuthProvider'
import './ModulesPage.css'
import './QuizAttemptPage.css'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | {
      status: 'submitted'
      attempt: { id: number; status: string; score: number; max_score: number; percent: number }
      results: ApiQuizAttemptResult[]
      feedback: ApiQuizAttemptFeedback
    }

export default function QuizAttemptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()

  const attemptId = useMemo(() => {
    const raw = params.attemptId
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) ? n : null
  }, [params.attemptId])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<ApiQuizAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  useEffect(() => {
    if (!user) return
    if (!attemptId) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getQuizAttempt(attemptId)
        setAttempt(resp.attempt)

        const next: Record<number, number | null> = {}
        for (const q of resp.attempt.questions) next[q.id] = null
        setAnswers(next)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load attempt.'))
      } finally {
        setBusy(false)
      }
    })()
  }, [user, attemptId])

  const questionCount = attempt?.questions.length ?? 0

  function setAnswer(questionId: number, optionId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  async function onSubmit() {
    if (!attemptId || !attempt) return

    setSubmitState({ status: 'submitting' })
    setError(null)

    try {
      const payload = {
        answers: attempt.questions.map((q) => ({
          question_id: q.id,
          selected_option_id: answers[q.id] ?? null,
        })),
      }

      const resp = await submitQuizAttempt(attemptId, payload)

      setSubmitState({
        status: 'submitted',
        attempt: resp.attempt,
        results: resp.results,
        feedback: resp.feedback,
      })
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to submit attempt.'))
      setSubmitState({ status: 'idle' })
    }
  }

  if (!user) return null

  if (!attemptId) {
    return (
      <div className="modulesPage">
        <div className="modulesShell">
          <div className="modulesMain">
            <main className="modulesContent">
              <div className="modulesError">Invalid attempt id.</div>
              <button type="button" className="moduleCta" onClick={() => navigate('/quizzes')}>
                Back to quizzes
              </button>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modulesPage">
      <div className="modulesShell">
        <aside className="modulesSidebar" aria-label="Sidebar navigation">
          <div className="modulesSidebarBrand">
            <div className="modulesAvatar" aria-hidden="true">
              {user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
            <div className="modulesBrandText">
              <div className="modulesBrandTitle">MinSU CyberAware</div>
              <div className="modulesBrandMeta">{user.email}</div>
            </div>
          </div>

          <nav className="modulesNav">
            <Link className="modulesNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem active" to="/quizzes" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <span className="modulesNavItem disabled" aria-disabled="true">
              <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
              <span>Achievements</span>
            </span>
          </nav>
        </aside>

        <div className="modulesMain">
          <header className="modulesTopbar">
            <div className="modulesTopbarInner">
              <div className="modulesTopbarLeft">
                <div className="modulesAvatar lg" aria-hidden="true">
                  {user.name?.trim()?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="modulesTitle">{attempt?.quiz?.title || 'Quiz'}</div>
                  <div className="modulesSubtitle">
                    {attempt?.quiz?.category?.name ? `${attempt.quiz.category.name} • ` : ''}
                    {attempt?.quiz?.difficulty ? attempt.quiz.difficulty.toUpperCase() : ''}
                  </div>
                </div>
              </div>

              <button type="button" className="modulesIconBtn" aria-label="Notifications">
                <span className="material-symbols-outlined" aria-hidden="true">
                  notifications
                </span>
              </button>
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Attempt summary">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Quiz Attempt</h1>
                  <p className="modulesHeroText">
                    Answer the questions then submit to see your score and feedback.
                  </p>
                </div>
              </div>
            </section>

            {error ? <div className="modulesError">{error}</div> : null}

            {busy && !attempt ? <div className="modulesLoading">Loading attempt…</div> : null}

            {attempt && submitState.status !== 'submitted' ? (
              <div className="quizWrap" aria-label="Quiz questions">
                {attempt.status !== 'in_progress' ? (
                  <div className="quizCard">
                    <div className="quizCardBody">
                      <div className="quizMetaRow">
                        <span>Status</span>
                        <strong>{attempt.status}</strong>
                      </div>
                      <p className="quizScenario">
                        This attempt is already finished. Start a new attempt from the quizzes page.
                      </p>
                      <div className="quizActions" style={{ marginTop: 12 }}>
                        <button type="button" className="moduleCta" onClick={() => navigate('/quizzes')}>
                          Back to quizzes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {attempt.status === 'in_progress'
                  ? attempt.questions.map((q, idx) => {
                      return (
                        <section key={q.id} className="quizCard" aria-label={`Question ${idx + 1}`}>
                          <div className="quizCardBody">
                            <div className="quizMetaRow">
                              <span>
                                Question {idx + 1} of {questionCount}
                              </span>
                              <span>{q.points} pts</span>
                            </div>

                            <h2 className="quizPrompt">{q.prompt}</h2>

                            {q.scenario ? <p className="quizScenario">{q.scenario}</p> : null}

                            {q.options?.length ? (
                              <div className="quizOptions" role="radiogroup" aria-label="Options">
                                {q.options.map((o) => {
                                  const label = (o.label || '').trim()
                                  const text = (o.text || '').trim()
                                  const display = label && text ? `${label}. ${text}` : label || text || `Option ${o.id}`

                                  return (
                                    <label key={o.id} className="quizOption">
                                      <input
                                        type="radio"
                                        name={`q_${q.id}`}
                                        value={o.id}
                                        checked={(answers[q.id] ?? null) === o.id}
                                        onChange={() => setAnswer(q.id, o.id)}
                                      />
                                      <span className="quizOptionText">{display}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="quizScenario">No options available for this question.</p>
                            )}
                          </div>
                        </section>
                      )
                    })
                  : null}

                {attempt.status === 'in_progress' ? (
                  <div className="quizCard">
                    <div className="quizCardBody">
                      <div className="quizActions">
                        <button type="button" className="moduleCta" onClick={() => navigate('/quizzes')}>
                          Exit
                        </button>
                        <button
                          type="button"
                          className="moduleCta primary"
                          onClick={onSubmit}
                          disabled={submitState.status === 'submitting'}
                          aria-disabled={submitState.status === 'submitting'}
                        >
                          {submitState.status === 'submitting' ? 'Submitting…' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {attempt && submitState.status === 'submitted' ? (
              <div className="quizWrap" aria-label="Quiz results">
                <div className="quizCard">
                  <div className="quizCardBody">
                    <div className="quizMetaRow">
                      <span>Score</span>
                      <strong>
                        {submitState.attempt.score} / {submitState.attempt.max_score} ({submitState.attempt.percent}%)
                      </strong>
                    </div>

                    <div className="quizActions" style={{ marginTop: 12 }}>
                      <button type="button" className="moduleCta" onClick={() => navigate('/quizzes')}>
                        Back to quizzes
                      </button>
                    </div>

                    {submitState.feedback?.tips?.length ? (
                      <div className="quizTips" aria-label="Tips">
                        {submitState.feedback.tips.map((t, i) => (
                          <div className="quizTip" key={i}>
                            {t}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {submitState.results.map((r, idx) => {
                  const badgeClass = r.is_correct ? 'good' : 'bad'
                  const badgeText = r.is_correct ? 'Correct' : 'Incorrect'

                  const correctLabel = r.correct_option
                    ? `${(r.correct_option.label || '').trim()}${r.correct_option.text ? `. ${(r.correct_option.text || '').trim()}` : ''}`
                    : null

                  return (
                    <section key={r.question_id} className="quizCard" aria-label={`Result ${idx + 1}`}>
                      <div className="quizCardBody">
                        <div className="quizMetaRow">
                          <span>Question {idx + 1}</span>
                          <span className={`quizBadge ${badgeClass}`}>{badgeText}</span>
                        </div>

                        <div className="quizMetaRow">
                          <span>
                            Earned {r.earned_points} / {r.points} pts
                          </span>
                          {correctLabel ? <span>Correct: {correctLabel}</span> : <span />}
                        </div>

                        {r.explanation ? <p className="quizResultExplain">{r.explanation}</p> : null}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : null}
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem" to="/simulations">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem active" to="/quizzes" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <span className="bottomNavItem" aria-disabled="true">
              <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
              <span>Achievements</span>
            </span>
          </nav>
        </div>
      </div>
    </div>
  )
}
