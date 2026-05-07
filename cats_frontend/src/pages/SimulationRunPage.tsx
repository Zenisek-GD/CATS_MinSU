import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import { chooseSimulation, getSimulationRun, type ApiSimulationOutcome, type ApiSimulationRun } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import { FeedbackForm, hasFeedbackBeenGiven } from '../components/FeedbackForm'
import { SimulationVideoPanel } from '../components/SimulationVideoPlayer'
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
// Emojis removed from simulation choices for cleaner UI
// function getChoiceIcon(action: string): string {
//   ... (emoji mapping removed)
// }

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
  const [showFeedback, setShowFeedback] = useState(false)
  const [showVideoPanel, setShowVideoPanel] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!runId) return

    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const resp = await getSimulationRun(runId)
        setRun(resp.run)
        // Show video panel if simulation has videos and the run just started
        const videos = resp.run.simulation?.videos ?? []
        if (videos.length > 0 && resp.run.status === 'in_progress') {
          setShowVideoPanel(true)
        }
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
    // If simulation just finished, check if we should show feedback
    if (run && run.status !== 'in_progress') {
      const simId = run.simulation?.id
      if (simId && !hasFeedbackBeenGiven('simulation', simId)) {
        setShowFeedback(true)
      }
    }
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
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="modulesNavItem active" to="/simulations" aria-current="page">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="modulesNavItem" to="/quizzes">
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
                  <div className="modulesTitle">{run?.simulation?.title || 'Simulation'}</div>
                  <div className="modulesSubtitle">Score: {scoreLabel}</div>
                </div>
              </div>

              <TopbarActions hideLogout={true} />
            </div>
          </header>

          <main className="modulesContent">
            {/* ── Video Panel: shown before simulation if videos exist ── */}
            {showVideoPanel && run?.simulation?.videos && run.simulation.videos.length > 0 && (
              <SimulationVideoPanel
                videos={run.simulation.videos}
                simTitle={run.simulation.title}
                onStart={() => setShowVideoPanel(false)}
              />
            )}

            {!showVideoPanel && <>
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
                          <Icon name="gpp_bad" size={18} />
                          Unsafe Choice
                        </span>
                        {outcomeState.outcome.score_delta !== undefined && outcomeState.outcome.score_delta !== 0 ? (
                          <div className="simOutcomeScore">
                            <Icon name="trending_down" size={18} />
                            <span>{outcomeState.outcome.score_delta} points</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="simDangerBody">
                        {/* Panel 1: What you did */}
                        <div className="simFeedbackPanel what-you-did">
                          <div className="simFeedbackPanelTitle">
                            <Icon name="touch_app" size={18} />
                            What you did
                          </div>
                          <p className="simFeedbackPanelText">{chosenText || 'Your choice'}</p>
                        </div>

                        {/* Panel 2: Why this is dangerous */}
                        <div className="simFeedbackPanel why-dangerous">
                          <div className="simFeedbackPanelTitle">
                            <Icon name="warning" size={18} />
                            Why this is dangerous
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.ai_feedback?.summary || outcomeState.outcome.feedback || outcomeState.outcome.explanation || 'This was an unsafe action.'}
                          </p>
                          {outcomeState.outcome.ai_feedback?.red_flags?.length ? (
                            <ul className="simRedFlagAnimated">
                              {outcomeState.outcome.ai_feedback.red_flags.map((rf, i) => (
                                <li className="simRedFlagItem" key={i}>
                                  <Icon name="error" size={18} />
                                  {rf}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        {/* Panel 3: What to do instead */}
                        <div className="simFeedbackPanel what-to-do">
                          <div className="simFeedbackPanelTitle">
                            <Icon name="lightbulb" size={18} />
                            What to do instead
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.ai_feedback?.what_to_do_next || outcomeState.outcome.explanation || 'Use safe and verified channels instead.'}
                          </p>
                        </div>

                        {!outcomeState.outcome.ai_feedback && choosingId === null ? (
                          <div className="simAiUnavailable">
                            <Icon name="info" size={18} />
                            <span>AI coaching is unavailable at this time.</span>
                          </div>
                        ) : null}

                        <div className="simContinueWrap">
                          {step ? (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <Icon name="arrow_forward" size={20} />
                              Continue to Next Step
                            </button>
                          ) : (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <Icon name="check_circle" size={20} />
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
                          <Icon name="verified_user" size={18} />
                          Safe Choice
                        </span>
                        {outcomeState.outcome.score_delta !== undefined && outcomeState.outcome.score_delta !== 0 ? (
                          <div className="simOutcomeScore">
                            <Icon name="trending_up" size={18} />
                            <span>+{outcomeState.outcome.score_delta} points</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="simSuccessBody">
                        <div className="simFeedbackPanel what-to-do">
                          <div className="simFeedbackPanelTitle">
                            <Icon name="check_circle" size={18} />
                            Great decision
                          </div>
                          <p className="simFeedbackPanelText">
                            {outcomeState.outcome.feedback || outcomeState.outcome.message || 'Good choice!'}
                          </p>
                        </div>

                        {outcomeState.outcome.explanation ? (
                          <div className="simFeedbackPanel what-to-do">
                            <div className="simFeedbackPanelTitle">
                              <Icon name="lightbulb" size={18} />
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
                              <Icon name="arrow_forward" size={20} />
                              Continue to Next Step
                            </button>
                          ) : (
                            <button type="button" className="moduleCta primary simContinueBtn" onClick={onContinue}>
                              <Icon name="check_circle" size={20} />
                              View Final Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : null}

                {/* ── COMPLETED/EXPIRED PANEL ── */}
                {status !== 'in_progress' && !outcomeState && !showFeedback ? (
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

                {/* ── FEEDBACK FORM after completion ── */}
                {showFeedback && run && (
                  <FeedbackForm
                    activityType="simulation"
                    activityId={run.simulation?.id}
                    onSubmit={() => setShowFeedback(false)}
                    onCancel={() => setShowFeedback(false)}
                  />
                )}

                {/* ── ACTIVE STEP: SCENARIO + CHOICES ── */}
                {status === 'in_progress' && step && showChoices ? (
                  <div className="simCard" aria-label="Current step">
                    <div className="simBody">

                      {/* Step header with stats */}
                      <div className="simStepHeader">
                        <div className="simStepTitle">
                          <Icon name={parsedPrompt?.isEmailLike ? 'mail' : 'description'} size={20} />
                          <span>{step.title || 'Scenario'}</span>
                        </div>
                        <div className="simStepStats">
                          <span className="simStatSafe">
                            <Icon name="check_circle" size={18} />
                            {run.stats?.safe_choices ?? 0}
                          </span>
                          <span className="simStatUnsafe">
                            <Icon name="cancel" size={18} />
                            {run.stats?.unsafe_choices ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Render the scenario — rich email card or plain text */}
                      {parsedPrompt?.isEmailLike ? (
                        <div className="simEmailCard" aria-label="Simulated email scenario">
                          <div className="simEmailHeader">
                            <Icon name="mail" size={20} />
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
                                    <Icon name="link" size={18} />
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
                          <Icon name="lightbulb" size={20} />
                          <div>
                            <div className="simEducationLabel">Tip</div>
                            <div className="simEducationText">{step.education}</div>
                          </div>
                        </div>
                      ) : null}

                      {/* Question prompt */}
                      <div className="simQuestionPrompt">
                        <Icon name="help_outline" size={20} />
                        <span>How would you handle this situation?</span>
                      </div>

                      {/* Choice decision cards */}
                      <div className="simChoices" aria-label="Choices">
                        {step.choices.map((c) => {
                          const parsed = parseChoiceText(c.text)

                          return (
                            <button
                              key={c.id}
                              type="button"
                              className="simChoiceCard"
                              onClick={() => onChoose(c.id)}
                              disabled={choosingId !== null}
                              aria-disabled={choosingId !== null}
                            >
                              <div className="simChoiceCardContent">
                                <div className="simChoiceCardAction">
                                  {choosingId === c.id ? 'Submitting…' : parsed.action}
                                </div>
                                {parsed.description ? (
                                  <div className="simChoiceCardDesc">{parsed.description}</div>
                                ) : null}
                              </div>
                              <Icon name="chevron_right" size={18} />
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
            {/* Close !showVideoPanel wrapper */}
            </>}
          </main>

          <nav className="modulesBottomNav" aria-label="Bottom navigation">
            <Link className="bottomNavItem" to="/modules">
              <Icon name="school" size={20} />
              <span>Learn</span>
            </Link>
            <Link className="bottomNavItem active" to="/simulations" aria-current="page">
              <Icon name="security" size={20} />
              <span>Simulate</span>
            </Link>
            <Link className="bottomNavItem" to="/quizzes">
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
