import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { getModule, updateModuleProgress, type ApiTrainingModule, type ApiModuleTopic } from '../api/modules'
import { startQuizAttempt } from '../api/quizzes'
import { useAuth } from '../auth/AuthProvider'
import { Icon } from '../components/IconMap'
import { TopbarActions } from '../components/TopbarActions'
import { FeedbackForm, hasFeedbackBeenGiven } from '../components/FeedbackForm'
import './ModuleViewerPage.css'

type Stage = 'reading' | 'post_test' | 'feedback' | 'done'

export default function ModuleViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [module, setModule] = useState<ApiTrainingModule | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTopicIndex, setActiveTopicIndex] = useState(0)
  const [startingQuiz, setStartingQuiz] = useState(false)

  // Determine initial stage from URL
  const [stage, setStage] = useState<Stage>(() => {
    const params = new URLSearchParams(location.search)
    return params.get('stage') === 'feedback' ? 'feedback' : 'reading'
  })

  useEffect(() => {
    if (!id || !user) return
    ;(async () => {
      try {
        const resp = await getModule(id)
        setModule(resp.module)

        // Resume from last topic if they have progress
        if (resp.module.user_progress?.last_topic_id && resp.module.topics) {
          const idx = resp.module.topics.findIndex(t => t.id === resp.module.user_progress?.last_topic_id)
          if (idx !== -1) setActiveTopicIndex(idx)
        }

        // If returning from quiz (stage=feedback), check if feedback already given
        const params = new URLSearchParams(location.search)
        if (params.get('stage') === 'feedback') {
          const alreadyGiven = hasFeedbackBeenGiven('module', resp.module.id)
          if (alreadyGiven) {
            setStage('done')
          } else {
            setStage('feedback')
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load module')
      } finally {
        setBusy(false)
      }
    })()
  }, [id, user])

  const topics = useMemo(() => module?.topics || [], [module])
  const activeTopic = topics[activeTopicIndex] as ApiModuleTopic | undefined

  const progressPercent = useMemo(() => {
    if (topics.length === 0) return 0
    if (module?.user_progress?.is_completed) return 100
    return Math.round((activeTopicIndex / topics.length) * 100)
  }, [activeTopicIndex, topics.length, module?.user_progress])

  const handleNext = async () => {
    if (!module || !activeTopic) return

    if (activeTopicIndex < topics.length - 1) {
      const nextIdx = activeTopicIndex + 1
      setActiveTopicIndex(nextIdx)
      updateModuleProgress(module.id, { last_topic_id: topics[nextIdx].id }).catch(console.error)
    } else {
      // Last topic — finish module
      await updateModuleProgress(module.id, { last_topic_id: activeTopic.id, is_completed: true })
      setModule(m => m ? { ...m, user_progress: { id: m.user_progress?.id || 0, last_topic_id: activeTopic.id, is_completed: true } } : null)

      // Transition to post-test or feedback
      if (module.quiz_id) {
        setStage('post_test')
      } else {
        const alreadyGiven = hasFeedbackBeenGiven('module', module.id)
        setStage(alreadyGiven ? 'done' : 'feedback')
      }
    }
  }

  const handlePrev = () => {
    if (activeTopicIndex > 0) {
      setActiveTopicIndex(activeTopicIndex - 1)
      if (module) {
        updateModuleProgress(module.id, { last_topic_id: topics[activeTopicIndex - 1].id }).catch(console.error)
      }
    }
  }

  async function handleStartPostTest() {
    if (!module?.quiz_id) return
    setStartingQuiz(true)
    try {
      const resp = await startQuizAttempt(module.quiz_id)
      // Return to THIS module's feedback stage after quiz is done
      const returnTo = encodeURIComponent(`/modules/${module.id}?stage=feedback`)
      navigate(`/quiz-attempts/${resp.attempt.id}?returnTo=${returnTo}`)
    } catch {
      setStartingQuiz(false)
      alert('Failed to start post-test. Please try again.')
    }
  }

  if (!user) return null
  if (busy) return <div className="moduleViewerPage"><div style={{ padding: 40 }}>Loading module…</div></div>
  if (error) return <div className="moduleViewerPage"><div style={{ padding: 40, color: 'red' }}>{error}</div></div>
  if (!module) return <div className="moduleViewerPage"><div style={{ padding: 40 }}>Module not found.</div></div>

  const isCompleted = module.user_progress?.is_completed

  // ── POST-TEST CTA ──────────────────────────────────────────────────────────
  if (stage === 'post_test') {
    return (
      <div className="moduleViewerPage">
        <div className="mvCompletionOverlay">
          <div className="mvCompletionCard">
            <div className="mvCompletionIcon">
              <Icon name="celebration" size={40} />
            </div>
            <h2 className="mvCompletionTitle">Module Complete!</h2>
            <p className="mvCompletionDesc">
              Great work finishing all {topics.length} topic{topics.length !== 1 ? 's' : ''} in{' '}
              <strong>{module.title}</strong>.<br />
              Now you must take the <strong>post-test</strong> to demonstrate your understanding.
            </p>
            <div className="mvCompletionSteps">
              <div className="mvCompletionStep done">
                <Icon name="check_circle" size={20} /> <span>Read all topics</span>
              </div>
              <div className="mvCompletionStep active">
                <Icon name="quiz" size={20} /> <span>Take the post-test</span>
              </div>
              <div className="mvCompletionStep">
                <Icon name="rate_review" size={20} /> <span>Share your feedback</span>
              </div>
            </div>
            <button
              className="mvCompletionBtn"
              onClick={handleStartPostTest}
              disabled={startingQuiz}
            >
              {startingQuiz ? 'Starting…' : 'Start Post-Test'}
              {!startingQuiz && <Icon name="arrow_forward" size={18} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div className="moduleViewerPage">
        <div className="mvCompletionOverlay">
          <div className="mvCompletionCard">
            <div className="mvCompletionIcon gold">
              <Icon name="workspace_premium" size={40} />
            </div>
            <h2 className="mvCompletionTitle">All done! 🎉</h2>
            <p className="mvCompletionDesc">
              You've finished <strong>{module.title}</strong>, completed the post-test, and shared your feedback. Well done!
            </p>
            <div className="mvCompletionSteps">
              <div className="mvCompletionStep done">
                <Icon name="check_circle" size={20} /> <span>Read all topics</span>
              </div>
              <div className="mvCompletionStep done">
                <Icon name="check_circle" size={20} /> <span>Post-test completed</span>
              </div>
              <div className="mvCompletionStep done">
                <Icon name="check_circle" size={20} /> <span>Feedback submitted</span>
              </div>
            </div>
            <div className="mvCompletionActions">
              <button className="mvCompletionBtn outline" onClick={() => navigate('/modules')}>
                <Icon name="library_books" size={18} /> Back to Modules
              </button>
              <button className="mvCompletionBtn" onClick={() => navigate('/')}>
                <Icon name="home" size={18} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="moduleViewerPage">
      {/* Feedback overlay (stage === 'feedback') */}
      {stage === 'feedback' && (
        <FeedbackForm
          activityType="module"
          activityId={module.id}
          onSubmit={() => setStage('done')}
          onCancel={() => setStage('done')}
        />
      )}

      <div className="mvShell">
        {topics.length > 0 && (
          <aside className="mvSidebar">
            <div className="mvSidebarHeader">
              <h2 className="mvSidebarTitle">Topics Overview</h2>
            </div>
            <div className="mvTopicList">
              {topics.map((t, idx) => {
                const isActive = idx === activeTopicIndex
                const isTopicCompleted = isCompleted || idx < activeTopicIndex

                return (
                  <button
                    key={t.id}
                    className={`mvTopicItem ${isActive ? 'active' : ''} ${isTopicCompleted && !isActive ? 'completed' : ''}`}
                    onClick={() => {
                      setActiveTopicIndex(idx)
                      updateModuleProgress(module.id, { last_topic_id: t.id }).catch(console.error)
                    }}
                  >
                    <Icon name={isTopicCompleted && !isActive ? 'check_circle' : isActive ? 'radio_button_checked' : 'radio_button_unchecked'} size={20} />
                    <span>{t.title}</span>
                  </button>
                )
              })}
            </div>
          </aside>
        )}

        <main className="mvMain">
          <header className="mvHeader">
            <div className="mvHeaderLeft">
              <Link to="/modules" className="mvBackBtn">
                <Icon name="arrow_back" size={20} />
              </Link>
              <h1 className="mvTitle">{module.title}</h1>
            </div>
            <div className="mvHeaderRight" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div className="mvProgress">
                <span>{progressPercent}% Complete</span>
                <div className="mvProgressBar">
                  <div className="mvProgressFill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <TopbarActions hideLogout={true} />
            </div>
          </header>

          {/* Mobile Topic Selector */}
          {topics.length > 0 && (
            <div className="mvMobileTopics">
              <select
                className="mvMobileSelect"
                value={activeTopicIndex}
                onChange={(e) => {
                  const idx = parseInt(e.target.value)
                  setActiveTopicIndex(idx)
                  updateModuleProgress(module.id, { last_topic_id: topics[idx].id }).catch(console.error)
                }}
              >
                {topics.map((t, idx) => (
                  <option key={t.id} value={idx}>
                    {idx + 1}. {t.title} {(isCompleted || idx < activeTopicIndex) && idx !== activeTopicIndex ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mvContentWrapper">
            <div className="mvContentArea">
              {activeTopic ? (
                <>
                  <h2 className="mvTopicTitle">{activeTopic.title}</h2>

                  <div className="mvRichContent" dangerouslySetInnerHTML={{ __html: activeTopic.content }} />

                  {/* If already completed + has quiz, show reminder CTA on last topic */}
                  {isCompleted && module.quiz_id && activeTopicIndex === topics.length - 1 && stage === 'reading' && (
                    <div className="mvQuizCta">
                      <div className="mvQuizCtaInner">
                        <Icon name="quiz" size={28} />
                        <h3 className="mvQuizTitle">Module already completed</h3>
                        <p className="mvQuizDesc">You finished this module. You can retake the post-test or share feedback.</p>
                        <button className="mvQuizBtn" onClick={() => setStage('post_test')}>
                          Retake Post-Test <Icon name="arrow_forward" size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mvFooter">
                    <button
                      className="mvBtn"
                      onClick={handlePrev}
                      disabled={activeTopicIndex === 0}
                    >
                      <Icon name="arrow_back" size={18} /> Previous
                    </button>

                    {activeTopicIndex < topics.length - 1 ? (
                      <button className="mvBtn primary" onClick={handleNext}>
                        Next Topic <Icon name="arrow_forward" size={18} />
                      </button>
                    ) : !isCompleted ? (
                      <button className="mvBtn primary" onClick={handleNext}>
                        Finish Module <Icon name="done_all" size={18} />
                      </button>
                    ) : (
                      <button className="mvBtn primary" onClick={() => navigate('/modules')}>
                        Back to Modules <Icon name="library_books" size={18} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: '100px 0', color: 'rgba(11,28,48,0.5)', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                  {topics.length === 0 ? 'No topics have been added to this module yet.' : 'Select a topic to begin.'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
