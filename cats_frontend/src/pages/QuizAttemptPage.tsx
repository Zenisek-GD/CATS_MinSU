import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  getQuizAttempt,
  submitQuizAttempt,
  type ApiAiFeedback,
  type ApiQuizAttempt,
  type ApiQuizAttemptFeedback,
  type ApiQuizAttemptResult,
} from '../api/quizzes'
import { getApiErrorMessage } from '../api/error'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import { useAuth } from '../auth/AuthProvider'
import { FeedbackForm, hasFeedbackBeenGiven } from '../components/FeedbackForm'
import './ModulesPage.css'
import './QuizAttemptPage.css'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | {
      status: 'feedback_pending'
      attempt: { id: number; status: string; score: number; max_score: number; percent: number; quiz_id: number }
      results: ApiQuizAttemptResult[]
      feedback: ApiQuizAttemptFeedback
      ai_feedback?: ApiAiFeedback | null
    }
  | {
      status: 'submitted'
      attempt: { id: number; status: string; score: number; max_score: number; percent: number }
      results: ApiQuizAttemptResult[]
      feedback: ApiQuizAttemptFeedback
      ai_feedback?: ApiAiFeedback | null
    }

function parseEmailScenario(raw: string) {
  const text = (raw || '').trim()
  if (!text) return null

  const lines = text.split(/\r?\n/)
  let subject: string | null = null
  let from: string | null = null
  const bodyLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    const subjMatch = trimmed.match(/^subject\s*:\s*(.*)$/i)
    if (subjMatch) {
      subject = subjMatch[1]?.trim() || null
      continue
    }

    const fromMatch = trimmed.match(/^from\s*:\s*(.*)$/i)
    if (fromMatch) {
      from = fromMatch[1]?.trim() || null
      continue
    }

    bodyLines.push(line)
  }

  const body = bodyLines.join('\n').trim()
  const isEmailLike = !!(subject || from)
  const bodyText = body || text
  const showCta = /\b(verify|click|sign\s?in|login|reset|update)\b|https?:\/\//i.test(bodyText)

  return {
    isEmailLike,
    subject,
    from,
    body: bodyText,
    showCta,
  }
}

export default function QuizAttemptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()

  // If coming from a module post-test, returnTo will be the module's feedback URL
  const returnTo = useMemo(() => {
    const sp = new URLSearchParams(location.search)
    const raw = sp.get('returnTo')
    return raw ? decodeURIComponent(raw) : null
  }, [location.search])

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

      // Check if student already gave feedback for this quiz
      const quizId = resp.attempt.quiz?.id
      const alreadyGaveFeedback = hasFeedbackBeenGiven('quiz', quizId)

      if (alreadyGaveFeedback || !quizId) {
        // Skip feedback form — go straight to results
        setSubmitState({
          status: 'submitted',
          attempt: resp.attempt,
          results: resp.results,
          feedback: resp.feedback,
          ai_feedback: resp.ai_feedback ?? null,
        })
      } else {
        // Show feedback form first
        setSubmitState({
          status: 'feedback_pending',
          attempt: { ...resp.attempt, quiz_id: quizId },
          results: resp.results,
          feedback: resp.feedback,
          ai_feedback: resp.ai_feedback ?? null,
        })
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to submit attempt.'))
      setSubmitState({ status: 'idle' })
    }
  }

  function onFeedbackSubmitted() {
    if (submitState.status === 'feedback_pending') {
      setSubmitState({
        status: 'submitted',
        attempt: submitState.attempt,
        results: submitState.results,
        feedback: submitState.feedback,
        ai_feedback: submitState.ai_feedback,
      })
    }
    // If there's a returnTo (coming from module), navigate there now
    if (returnTo) {
      navigate(returnTo)
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

              <TopbarActions hideLogout={true} />
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

                            {q.scenario ? (
                              (() => {
                                const parsed = parseEmailScenario(q.scenario)
                                if (!parsed?.isEmailLike) return <p className="quizScenario">{q.scenario}</p>

                                return (
                                  <div className="quizScenarioBox" aria-label="Simulated scenario">
                                    <div className="quizScenarioBoxHeader">
                                      <Icon name="mail" size={20} />
                                      <span className="quizScenarioBoxTitle">Simulated Scenario</span>
                                    </div>

                                    <div className="quizScenarioEmail">
                                      {parsed.subject ? (
                                        <div className="quizScenarioRow">
                                          <span className="quizScenarioLabel">Subject:</span>
                                          <span className="quizScenarioSubject">{parsed.subject}</span>
                                        </div>
                                      ) : null}

                                      {parsed.from ? (
                                        <div className="quizScenarioRow">
                                          <span className="quizScenarioLabel">From:</span>
                                          <span className="quizScenarioFrom">{parsed.from}</span>
                                        </div>
                                      ) : null}

                                      <div className="quizScenarioBody">{parsed.body}</div>

                                      {parsed.showCta ? (
                                        <div className="quizScenarioCtaRow">
                                          <span className="quizScenarioCta" aria-disabled="true">
                                            VERIFY NOW →
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })()
                            ) : null}

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
                        <button type="button" className="moduleCta" onClick={() => navigate(returnTo || '/quizzes')}>
                          {returnTo ? 'Back to Module' : 'Exit'}
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

                      {submitState.status === 'submitting' ? (
                        <div className="quizAiLoading" style={{ marginTop: 14 }}>
                          <span className="quizAiIcon" aria-hidden="true">🤖</span>
                          <span>Generating adaptive feedback…</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Feedback form after quiz submission */}
            {attempt && submitState.status === 'feedback_pending' ? (
              <FeedbackForm
                activityType="quiz"
                activityId={submitState.attempt.quiz_id}
                onSubmit={onFeedbackSubmitted}
                onCancel={() => {
                  // Allow skipping feedback - move to results
                  onFeedbackSubmitted()
                }}
              />
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
                      <button type="button" className="moduleCta" onClick={() => navigate(returnTo || '/quizzes')}>
                        {returnTo ? 'Back to Module' : 'Back to quizzes'}
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

                {submitState.ai_feedback ? (
                  <div className="quizCard" aria-label="Adaptive feedback">
                    <div className="quizCardBody">
                      <div className="quizMetaRow">
                        <span>Adaptive feedback</span>
                        <span className="quizBadge good">AI Coach</span>
                      </div>

                      <p className="quizResultExplain">{submitState.ai_feedback.summary}</p>

                      {submitState.ai_feedback.red_flags?.length ? (
                        <div className="quizTips" aria-label="Red flags">
                          {submitState.ai_feedback.red_flags.map((t, i) => (
                            <div className="quizTip" key={i}>
                              {t}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <p className="quizResultExplain">
                        <strong>Next step:</strong> {submitState.ai_feedback.what_to_do_next}
                      </p>
                    </div>
                  </div>
                ) : submitState.ai_feedback === null ? (
                  <div className="quizAiUnavailable">
                    <Icon name="info" size={20} />
                    <span>AI coaching is unavailable at this time. Review the explanations below for guidance.</span>
                  </div>
                ) : null}

                {submitState.results.map((r, idx) => {
                  const badgeClass = r.is_correct ? 'good' : 'bad'
                  const badgeText = r.is_correct ? 'Correct' : 'Incorrect'

                  const correctLabel = r.correct_option
                    ? `${(r.correct_option.label || '').trim()}${r.correct_option.text ? `. ${(r.correct_option.text || '').trim()}` : ''}`
                    : null

                  const selectedLabel = r.selected_option
                    ? `${(r.selected_option.label || '').trim()}${r.selected_option.text ? `. ${(r.selected_option.text || '').trim()}` : ''}`
                    : null

                  return (
                    <section key={r.question_id} className={`quizCard ${!r.is_correct ? 'quizCardWrong' : ''}`} aria-label={`Result ${idx + 1}`}>
                      <div className="quizCardBody">
                        <div className="quizMetaRow">
                          <span>Question {idx + 1}</span>
                          <span className={`quizBadge ${badgeClass}`}>{badgeText}</span>
                        </div>

                        {/* Show the question prompt */}
                        <h3 className="quizResultPrompt">{r.prompt}</h3>

                        {/* Show scenario context if present */}
                        {r.scenario ? (
                          <div className="quizResultScenario">
                            <Icon name="description" size={20} />
                            <span>{r.scenario}</span>
                          </div>
                        ) : null}

                        {/* Show what the user selected */}
                        {!r.is_correct && selectedLabel ? (
                          <div className="quizResultAnswer wrong">
                            <Icon name="close" size={20} />
                            <div>
                              <div className="quizResultAnswerLabel">Your answer</div>
                              <div className="quizResultAnswerText">{selectedLabel}</div>
                            </div>
                          </div>
                        ) : null}

                        {/* Show the correct answer */}
                        {correctLabel ? (
                          <div className={`quizResultAnswer ${r.is_correct ? 'correct' : 'correctHint'}`}>
                            <Icon name="check_circle" size={20} />
                            <div>
                              <div className="quizResultAnswerLabel">{r.is_correct ? 'Your answer' : 'Correct answer'}</div>
                              <div className="quizResultAnswerText">{correctLabel}</div>
                            </div>
                          </div>
                        ) : null}

                        <div className="quizMetaRow" style={{ marginTop: 8 }}>
                          <span>
                            Earned {r.earned_points} / {r.points} pts
                          </span>
                        </div>

                        {/* Show explanation — especially important for wrong answers */}
                        {r.explanation ? (
                          <div className={`quizResultExplainBox ${!r.is_correct ? 'warning' : ''}`}>
                            <div className="quizResultExplainHeader">
                              <Icon name={r.is_correct ? 'lightbulb' : 'warning'} size={20} />
                              <span>{r.is_correct ? 'Why this is correct' : 'Why your answer was wrong'}</span>
                            </div>
                            <p className="quizResultExplainText">{r.explanation}</p>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : null}
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
