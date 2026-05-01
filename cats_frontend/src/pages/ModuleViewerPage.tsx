import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getModule, updateModuleProgress, type ApiTrainingModule, type ApiModuleTopic } from '../api/modules'
import { useAuth } from '../auth/AuthProvider'
import { TopbarActions } from '../components/TopbarActions'
import './ModuleViewerPage.css'

export default function ModuleViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [module, setModule] = useState<ApiTrainingModule | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTopicIndex, setActiveTopicIndex] = useState(0)

  useEffect(() => {
    if (!id || !user) return
    ;(async () => {
      try {
        const resp = await getModule(id)
        setModule(resp.module)
        
        // Resume from last topic if they have progress
        if (resp.module.user_progress && resp.module.user_progress.last_topic_id && resp.module.topics) {
          const idx = resp.module.topics.findIndex(t => t.id === resp.module.user_progress?.last_topic_id)
          if (idx !== -1) {
            setActiveTopicIndex(idx)
          }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load module')
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
    // If they are on topic 0, they have completed 0%. 
    // Wait, let's say progress is based on the active topic they are viewing if they haven't completed it.
    // If they just opened it, 0%.
    return Math.round((activeTopicIndex / topics.length) * 100)
  }, [activeTopicIndex, topics.length, module?.user_progress])

  const handleNext = async () => {
    if (!module || !activeTopic) return

    if (activeTopicIndex < topics.length - 1) {
      const nextIdx = activeTopicIndex + 1
      setActiveTopicIndex(nextIdx)
      
      // Save progress (lazy, no await needed to block UI)
      updateModuleProgress(module.id, { last_topic_id: topics[nextIdx].id }).catch(console.error)
    } else {
      // Finished the last topic!
      await updateModuleProgress(module.id, { last_topic_id: activeTopic.id, is_completed: true })
      // Re-trigger progress render
      setModule(m => m ? { ...m, user_progress: { id: m.user_progress?.id || 0, last_topic_id: activeTopic.id, is_completed: true } } : null)
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

  if (!user) return null

  if (busy) return <div className="moduleViewerPage"><div style={{ padding: 40 }}>Loading module...</div></div>
  if (error) return <div className="moduleViewerPage"><div style={{ padding: 40, color: 'red' }}>{error}</div></div>
  if (!module) return <div className="moduleViewerPage"><div style={{ padding: 40 }}>Module not found.</div></div>

  const isCompleted = module.user_progress?.is_completed
  const showQuizCta = isCompleted && module.quiz_id

  return (
    <div className="moduleViewerPage">
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
                    <span className="material-symbols-outlined mvTopicIcon">
                      {isTopicCompleted && !isActive ? 'check_circle' : isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
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
                <span className="material-symbols-outlined">arrow_back</span>
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
              <TopbarActions />
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
                    {idx + 1}. {t.title} {(isCompleted || idx < activeTopicIndex) && idx !== activeTopicIndex ? ' (Completed)' : ''}
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

                  {showQuizCta && activeTopicIndex === topics.length - 1 && (
                    <div className="mvQuizCta">
                      <div className="mvQuizCtaInner">
                        <span className="material-symbols-outlined mvQuizIcon">quiz</span>
                        <h3 className="mvQuizTitle">Ready to test your knowledge?</h3>
                        <p className="mvQuizDesc">You've completed all topics in this module. Take the quiz to earn points!</p>
                        <button className="mvQuizBtn" onClick={() => navigate(`/quizzes/${module.quiz_id}`)}>
                          Take Module Quiz <span className="material-symbols-outlined">arrow_forward</span>
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
                      <span className="material-symbols-outlined">arrow_back</span> Previous
                    </button>
                    
                    {activeTopicIndex < topics.length - 1 ? (
                      <button className="mvBtn primary" onClick={handleNext}>
                        Next Topic <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    ) : !isCompleted ? (
                      <button className="mvBtn primary" onClick={handleNext}>
                        Finish Module <span className="material-symbols-outlined">done_all</span>
                      </button>
                    ) : null}
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
