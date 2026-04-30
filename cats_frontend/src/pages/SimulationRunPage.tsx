import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/error'
import { chooseSimulation, getSimulationRun, type ApiSimulationOutcome, type ApiSimulationRun } from '../api/simulations'
import { useAuth } from '../auth/AuthProvider'
import './ModulesPage.css'
import './SimulationRunPage.css'

type OutcomeState = { outcome: ApiSimulationOutcome; at: string } | null

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

    setChoosingId(choiceId)
    setError(null)

    try {
      const resp = await chooseSimulation(runId, choiceId)
      setRun(resp.run)
      setOutcomeState({ outcome: resp.outcome, at: new Date().toISOString() })
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to submit choice.'))
    } finally {
      setChoosingId(null)
    }
  }

  const scoreLabel = run ? `${run.score} / ${run.max_score}` : '—'

  const outcomeClass = outcomeState?.outcome?.is_safe === false ? 'bad' : ''

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
                  <div className="modulesTitle">{run?.simulation?.title || 'Simulation'}</div>
                  <div className="modulesSubtitle">Score: {scoreLabel}</div>
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
            <section className="modulesHero" aria-label="Simulation intro">
              <div className="modulesHeroInner">
                <div>
                  <h1 className="modulesHeroTitle">Training Simulation</h1>
                  <p className="modulesHeroText">
                    Make your best decision. You’ll see feedback after each choice.
                  </p>
                </div>
              </div>
            </section>

            {error ? <div className="modulesError">{error}</div> : null}

            {busy && !run ? <div className="modulesLoading">Loading run…</div> : null}

            {run ? (
              <div className="simWrap" aria-label="Simulation run">
                {outcomeState?.outcome ? (
                  <div className={`simOutcome ${outcomeClass}`} aria-label="Outcome">
                    <strong>{outcomeState.outcome.feedback || outcomeState.outcome.message || 'Outcome'}</strong>
                    {outcomeState.outcome.explanation ? (
                      <div style={{ marginTop: 8 }}>{outcomeState.outcome.explanation}</div>
                    ) : null}
                  </div>
                ) : null}

                {status !== 'in_progress' ? (
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

                      <div className="simActions">
                        <button type="button" className="moduleCta" onClick={() => navigate('/simulations')}>
                          Back to simulations
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {status === 'in_progress' && step ? (
                  <div className="simCard" aria-label="Current step">
                    <div className="simBody">
                      <div className="simMetaRow">
                        <span>{step.title || 'Scenario'}</span>
                        <span>
                          Safe: {run.stats?.safe_choices ?? 0} • Unsafe: {run.stats?.unsafe_choices ?? 0}
                        </span>
                      </div>

                      <div className="simPrompt">{step.prompt}</div>

                      {step.education ? <div className="simEducation">{step.education}</div> : null}

                      <div className="simChoices" aria-label="Choices">
                        {step.choices.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="moduleCta"
                            onClick={() => onChoose(c.id)}
                            disabled={choosingId !== null}
                            aria-disabled={choosingId !== null}
                          >
                            {choosingId === c.id ? 'Choosing…' : c.text}
                          </button>
                        ))}
                      </div>

                      <div className="simActions">
                        <button type="button" className="moduleCta" onClick={() => navigate('/simulations')}>
                          Exit
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {status === 'in_progress' && !step ? (
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
