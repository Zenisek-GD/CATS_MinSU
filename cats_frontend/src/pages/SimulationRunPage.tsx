import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import { TopbarActions } from '../components/TopbarActions'
import { chooseSimulation, getSimulationRun, type ApiSimulationOutcome, type ApiSimulationRun } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import './ModulesPage.css'
import './SimulationRunPage.css'

type OutcomeState = { outcome: ApiSimulationOutcome; at: string } | null

/**
 * Parses an email-like prompt into structured fields for realistic display.
 * Supports From, Reply-To, To, Subject headers and body content.
 */
function parseEmailPrompt(raw: string) {
  const text = (raw || '').trim()
  if (!text) return null

  const lines = text.split(/\r?\n/)
  let subject: string | null = null
  let from: string | null = null
  let replyTo: string | null = null
  let to: string | null = null
  const bodyLines: string[] = []
  let inBody = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!inBody) {
      const subjMatch = trimmed.match(/^subject\s*:\s*(.*)$/i)
      if (subjMatch) { subject = subjMatch[1]?.trim() || null; continue }

      const fromMatch = trimmed.match(/^from\s*:\s*(.*)$/i)
      if (fromMatch) { from = fromMatch[1]?.trim() || null; continue }

      const replyMatch = trimmed.match(/^reply-?to\s*:\s*(.*)$/i)
      if (replyMatch) { replyTo = replyMatch[1]?.trim() || null; continue }

      const toMatch = trimmed.match(/^to\s*:\s*(.*)$/i)
      if (toMatch) { to = toMatch[1]?.trim() || null; continue }

      // Empty line after headers = start of body
      if (trimmed === '' && (subject || from || to)) { inBody = true; continue }
    }

    if (inBody || (!subject && !from && !to)) {
      bodyLines.push(line)
    }
  }

  const body = bodyLines.join('\n').trim()
  const isEmailLike = !!(subject || from)
  const bodyText = body || text

  // Detect suspicious links/URLs in the body
  const urlMatches = bodyText.match(/https?:\/\/[^\s<>"]+/g)
  const hasSuspiciousLink = !!(urlMatches && urlMatches.length > 0)

  // Detect CTA-like words
  const showCta = /\b(verify|click|sign\s?in|login|reset|update|confirm|renew)\b|https?:\/\//i.test(bodyText)

  return {
    isEmailLike,
    subject,
    from,
    replyTo,
    to,
    body: bodyText,
    urls: urlMatches || [],
    hasSuspiciousLink,
    showCta,
  }
}

/**
 * Parses choice text using "ACTION: description" convention.
 * Falls back to full text as action if no colon separator found.
 */
function parseChoiceText(raw: string) {
  const colonIdx = raw.indexOf(':')
  if (colonIdx > 0 && colonIdx < 30) {
    return { action: raw.slice(0, colonIdx).trim(), description: raw.slice(colonIdx + 1).trim() }
  }
  return { action: raw, description: '' }
}

/** Map action keywords to emoji icons */
function getChoiceIcon(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('click') || a.includes('open') || a.includes('tap')) return '🔗'
  if (a.includes('report') || a.includes('block')) return '🛡️'
  if (a.includes('delete') || a.includes('ignore') || a.includes('close')) return '🗑️'
  if (a.includes('reply') || a.includes('forward') || a.includes('send') || a.includes('submit')) return '✉️'
  if (a.includes('verify') || a.includes('check') || a.includes('secure')) return '🔍'
  if (a.includes('warn') || a.includes('alert')) return '📢'
  if (a.includes('hang') || a.includes('end')) return '📵'
  if (a.includes('share') || a.includes('enter') || a.includes('use')) return '⚠️'
  if (a.includes('do nothing') || a.includes('forget')) return '💤'
  if (a.includes('partial')) return '📝'
  return '👆'
}

export default function SimulationRunPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()

  const runId = useMemo(() => {
    const raw = params.runId
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) ? n : null
  }, [params.runId])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState<ApiSimulationRun | null>(null)
  const [outcomeState, setOutcomeState] = useState<OutcomeState>(null)
  const [choosingId, setChoosingId] = useState<number | null>(null)
  const [showChoices, setShowChoices] = useState(true)
  const [chosenText, setChosenText] = useState<string>('')

  useEffect(() => {
    if (!user) return
    if (!runId) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getSimulationRun(runId)
        setRun(resp.run)
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, 'Failed to load simulation run.'))
      } finally {
        setBusy(false)
      }
    })()
  }, [user, runId])

  if (!user) return null

  if (!runId) {
    return (
      <div className="modulesPage">
        <div className="modulesShell">
          <div className="modulesMain">
            <main className="modulesContent">
              <div className="modulesError">Invalid run id.</div>
              <button type="button" className="moduleCta" onClick={() => navigate('/simulations')}>
                Back to simulations
              </button>
            </main>
          </div>
        </div>
      </div>
    )
  }

  const step = run?.current_step
  const status = run?.status

  async function onChoose(choiceId: number) {
    if (!runId) return

    // Store chosen text for feedback display
    const chosenChoice = step?.choices.find(c => c.id === choiceId)
    if (chosenChoice) setChosenText(chosenChoice.text)

    setChoosingId(choiceId)
    setError(null)

    try {
      const resp = await chooseSimulation(runId, choiceId)
      setRun(resp.run)
      setOutcomeState({ outcome: resp.outcome, at: new Date().toISOString() })
      setShowChoices(false) // Hide choices, show feedback
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to submit choice.'))
    } finally {
      setChoosingId(null)
    }
  }

  function onContinue() {
    setOutcomeState(null)
    setShowChoices(true)
  }

  const scoreLabel = run ? `${run.score} / ${run.max_score}` : '—'

  // Parse the step prompt for email-like display
  const parsedPrompt = step?.prompt ? parseEmailPrompt(step.prompt) : null

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
            <Link className="modulesNavItem active" to="/simulations" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="modulesNavItem" to="/profile">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
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
                  <div className="modulesTitle">{run?.simulation?.title || 'Simulation'}</div>
                  <div className="modulesSubtitle">Score: {scoreLabel}</div>
                </div>
              </div>

              <TopbarActions />
            </div>
          </header>

          <main className="modulesContent">
            <section className="modulesHero" aria-label="Simulation intro">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Training Simulation</h1>
                  <p className="modulesHeroText">
                    Read the scenario carefully, then decide how to handle it. You'll get instant feedback on your choices.
                  </p>
                </div>
              </div>
            </section>

            {error ? <div className="modulesError">{error}</div> : null}

            {busy && !run ? <div className="modulesLoading">Loading run…</div> : null}

            {run ? (
              <div className="simWrap" aria-label="Simulation run">

                {/* ── FEEDBACK OVERLAY (shown after a choice) ── */}
                {outcomeState?.outcome ? (
                  outcomeState.outcome.is_safe === false ? (
                    /* ── DANGER OVERLAY ── */
                    <div className="simDangerOverlay" aria-label="Unsafe choice feedback">
                      <div className="simDangerOverlayHeader">
                        <span className="simDangerBadge">
                          <span className="material-symbols-outlined" aria-hidden="true">gpp_bad</span>
                          Unsafe Choice
                        </span>
                        {outcomeState.outcome.score_delta !== undefined && outcomeState.outcome.score_delta !== 0 ? (
                          <div className="simOutcomeScore">
                            <span className="material-symbols-outlined" aria-hidden="true">trending_down</span>
                            <span>{outcomeState.outcome.score_delta} points</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="simDangerBody">
                        {/* Panel 1: What you did */}
                        <div className="simFeedbackPanel what-you-did">
                          <div className="simFeedbackPanelTitle">
                            <span className="material-symbols-outlined" aria-hidden="true">touch_app</span>
                            What you did
                          </div>
                          <p className="simFeedbackPanelText">{chosenText || 'Your choice'}</p>
                        </div>

                        {/* Panel 2: Why this is dangerous */}
                        <div className="simFeedbackPanel why-dangerous">
                          <div className="simFeedbackPanelTitle">
                            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
                            Why this is dangerous
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.ai_feedback?.summary || outcomeState.outcome.feedback || outcomeState.outcome.explanation || 'This was an unsafe action.'}
                          </p>
                          {outcomeState.outcome.ai_feedback?.red_flags?.length ? (
                            <ul className="simRedFlagAnimated">
                              {outcomeState.outcome.ai_feedback.red_flags.map((rf, i) => (
                                <li className="simRedFlagItem" key={i}>
                                  <span className="material-symbols-outlined" aria-hidden="true">error</span>
                                  {rf}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        {/* Panel 3: What to do instead */}
                        <div className="simFeedbackPanel what-to-do">
                          <div className="simFeedbackPanelTitle">
                            <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                            What to do instead
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.ai_feedback?.what_to_do_next || outcomeState.outcome.explanation || 'Use safe and verified channels instead.'}
                          </p>
                        </div>

                        {!outcomeState.outcome.ai_feedback && choosingId === null ? (
                          <div className="simAiUnavailable">
                            <span className="material-symbols-outlined" aria-hidden="true">info</span>
                            <span>AI coaching is unavailable at this time.</span>
                          </div>
                        ) : null}

                        <div className="simContinueWrap">
                          {step ? (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                              Continue to Next Step
                            </button>
                          ) : (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                              View Final Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── SUCCESS OVERLAY ── */
                    <div className="simSuccessOverlay" aria-label="Safe choice feedback">
                      <div className="simSuccessOverlayHeader">
                        <span className="simSuccessBadge">
                          <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
                          Safe Choice
                        </span>
                        {outcomeState.outcome.score_delta !== undefined && outcomeState.outcome.score_delta !== 0 ? (
                          <div className="simOutcomeScore">
                            <span className="material-symbols-outlined" aria-hidden="true">trending_up</span>
                            <span>+{outcomeState.outcome.score_delta} points</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="simSuccessBody">
                        <div className="simFeedbackPanel what-to-do">
                          <div className="simFeedbackPanelTitle">
                            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Great decision
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.feedback || outcomeState.outcome.message || 'Good choice!'}
                          </p>
                        </div>

                        {outcomeState.outcome.explanation ? (
                          <div className="simFeedbackPanel what-to-do">
                            <div className="simFeedbackPanelTitle">
                              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                              Why this was right
                            </div>
                            <p className="simFeedbackPanelText">{outcomeState.outcome.explanation}</p>
                          </div>
                        ) : null}

                        {outcomeState.outcome.ai_feedback ? (
                          <div className="simAiFeedback">
                            <div className="simAiFeedbackHeader">
                              <span className="simAiFeedbackTitle">Reinforcement</span>
                              <span className="simAiBadge">AI Coach</span>
                            </div>
                            <div className="simAiSummary">{outcomeState.outcome.ai_feedback.summary}</div>
                            {outcomeState.outcome.ai_feedback.what_to_do_next ? (
                              <div className="simAiNextStep">
                                <strong>Tip:</strong> {outcomeState.outcome.ai_feedback.what_to_do_next}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="simContinueWrap">
                          {step ? (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                              Continue to Next Step
                            </button>
                          ) : (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                              View Final Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : null}

                {/* ── COMPLETED/EXPIRED PANEL ── */}
                {status !== 'in_progress' && !outcomeState ? (
                  <div className="simCard">
                    <div className="simBody">
                      <div className="simMetaRow">
                        <span>Status</span>
                        <strong>{status}</strong>
                      </div>
                      <div className="simMetaRow">
                        <span>Final score</span>
                        <strong>{scoreLabel}</strong>
                      </div>
                      <div className="simMetaRow">
                        <span>Safe choices</span>
                        <strong>{run.stats?.safe_choices ?? 0}</strong>
                      </div>
                      <div className="simMetaRow">
                        <span>Unsafe choices</span>
                        <strong>{run.stats?.unsafe_choices ?? 0}</strong>
                      </div>

                      <div className="simActions">
                        <button type="button" className="moduleCta" onClick={() => navigate('/simulations')}>
                          Back to simulations
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* ── ACTIVE STEP: SCENARIO + CHOICES ── */}
                {status === 'in_progress' && step && showChoices ? (
                  <div className="simCard" aria-label="Current step">
                    <div className="simBody">

                      {/* Step header with stats */}
                      <div className="simStepHeader">
                        <div className="simStepTitle">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {parsedPrompt?.isEmailLike ? 'mail' : 'description'}
                          </span>
                          <span>{step.title || 'Scenario'}</span>
                        </div>
                        <div className="simStepStats">
                          <span className="simStatSafe">
                            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            {run.stats?.safe_choices ?? 0}
                          </span>
                          <span className="simStatUnsafe">
                            <span className="material-symbols-outlined" aria-hidden="true">cancel</span>
                            {run.stats?.unsafe_choices ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Render the scenario — rich email card or plain text */}
                      {parsedPrompt?.isEmailLike ? (
                        <div className="simEmailCard" aria-label="Simulated email scenario">
                          <div className="simEmailHeader">
                            <span className="material-symbols-outlined simEmailIcon" aria-hidden="true">mail</span>
                            <span className="simEmailHeaderLabel">Simulated Scenario</span>
                          </div>

                          <div className="simEmailContent">
                            {parsedPrompt.subject ? (
                              <div className="simEmailRow">
                                <span className="simEmailLabel">Subject:</span>
                                <span className="simEmailSubject">{parsedPrompt.subject}</span>
                              </div>
                            ) : null}

                            {parsedPrompt.from ? (
                              <div className="simEmailRow">
                                <span className="simEmailLabel">From:</span>
                                <span className="simEmailFrom">{parsedPrompt.from}</span>
                              </div>
                            ) : null}

                            {parsedPrompt.replyTo ? (
                              <div className="simEmailRow">
                                <span className="simEmailLabel">Reply-To:</span>
                                <span className="simEmailFrom">{parsedPrompt.replyTo}</span>
                              </div>
                            ) : null}

                            {parsedPrompt.to ? (
                              <div className="simEmailRow">
                                <span className="simEmailLabel">To:</span>
                                <span className="simEmailTo">{parsedPrompt.to}</span>
                              </div>
                            ) : null}

                            <div className="simEmailBody">{parsedPrompt.body}</div>

                            {parsedPrompt.hasSuspiciousLink ? (
                              <div className="simEmailLinkWarn">
                                {parsedPrompt.urls.map((url, i) => (
                                  <div key={i} className="simEmailLink">
                                    <span className="material-symbols-outlined" aria-hidden="true">link</span>
                                    <span>{url}</span>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {parsedPrompt.showCta ? (
                              <div className="simEmailCtaRow">
                                <span className="simEmailCta" aria-disabled="true">
                                  {parsedPrompt.subject?.match(/password/i) ? 'UPDATE PASSWORD →' : 'VERIFY NOW →'}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="simPrompt">{step.prompt}</div>
                      )}

                      {/* Education tip */}
                      {step.education ? (
                        <div className="simEducationBox">
                          <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                          <div>
                            <div className="simEducationLabel">Tip</div>
                            <div className="simEducationText">{step.education}</div>
                          </div>
                        </div>
                      ) : null}

                      {/* Question prompt */}
                      <div className="simQuestionPrompt">
                        <span className="material-symbols-outlined" aria-hidden="true">help_outline</span>
                        <span>How would you handle this situation?</span>
                      </div>

                      {/* Choice decision cards */}
                      <div className="simChoices" aria-label="Choices">
                        {step.choices.map((c) => {
                          const parsed = parseChoiceText(c.text)
                          const icon = getChoiceIcon(parsed.action)

                          return (
                            <button
                              key={c.id}
                              type="button"
                              className="simChoiceCard"
                              onClick={() => onChoose(c.id)}
                              disabled={choosingId !== null}
                              aria-disabled={choosingId !== null}
                            >
                              <span className="simChoiceCardIcon" aria-hidden="true">{icon}</span>
                              <div className="simChoiceCardContent">
                                <div className="simChoiceCardAction">
                                  {choosingId === c.id ? 'Submitting…' : parsed.action}
                                </div>
                                {parsed.description ? (
                                  <div className="simChoiceCardDesc">{parsed.description}</div>
                                ) : null}
                              </div>
                              <span className="material-symbols-outlined simChoiceCardArrow" aria-hidden="true">chevron_right</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* AI loading shimmer while waiting */}
                      {choosingId !== null ? (
                        <div className="simAiLoading">
                          <span className="simAiIcon" aria-hidden="true">🤖</span>
                          <span>Analyzing your decision…</span>
                        </div>
                      ) : null}

                      <div className="simActions">
                        <button type="button" className="moduleCta" onClick={() => navigate('/simulations')}>
                          Exit Simulation
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {status === 'in_progress' && !step && !outcomeState ? (
                  <div className="modulesError">This run has no active step.</div>
                ) : null}
              </div>
            ) : null}
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <span className="material-symbols-outlined" aria-hidden="true">school</span>
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem active" to="/simulations" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              <span>Assess</span>
            </Link>
            <Link className="bottomNavItem" to="/profile">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
