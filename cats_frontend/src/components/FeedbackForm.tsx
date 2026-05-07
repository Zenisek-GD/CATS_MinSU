import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import '../styles/FeedbackForm.css'

interface FeedbackFormProps {
  activityType: 'quiz' | 'simulation' | 'module' | 'general'
  activityId?: number
  onSubmit?: () => void
  onCancel?: () => void
}

/** localStorage key to track whether feedback was already given */
export function feedbackGivenKey(type: string, id?: number) {
  return `cats_feedback_${type}_${id ?? 'general'}`
}

export function hasFeedbackBeenGiven(type: string, id?: number) {
  return localStorage.getItem(feedbackGivenKey(type, id)) === '1'
}

export function FeedbackForm({ activityType, activityId, onSubmit, onCancel }: FeedbackFormProps) {
  const { token } = useAuth()
  const [scores, setScores] = useState({
    usability: 0,
    relevance: 0,
    practicality: 0,
    engagement: 0,
  })
  const [comment, setComment] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [recommend, setRecommend] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload: Record<string, unknown> = {
        feedback_type: activityType,
        usability_score: scores.usability > 0 ? scores.usability : null,
        relevance_score: scores.relevance > 0 ? scores.relevance : null,
        practicality_score: scores.practicality > 0 ? scores.practicality : null,
        engagement_score: scores.engagement > 0 ? scores.engagement : null,
        comment: comment.trim() || null,
        perceived_difficulty: difficulty || null,
        would_recommend: recommend,
      }

      if (activityType === 'quiz' && activityId) payload.quiz_id = activityId
      else if (activityType === 'simulation' && activityId) payload.simulation_id = activityId
      else if (activityType === 'module' && activityId) payload.training_module_id = activityId

      if (!token) throw new Error('Not authenticated. Please log in again.')

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorData: Record<string, unknown> = {}
        try { errorData = await response.json() } catch { /* ignore */ }
        const errMsg = typeof errorData?.message === 'string'
          ? errorData.message
          : `HTTP ${response.status}`
        throw new Error(errMsg)
      }

      // Mark as given in localStorage so it won't show again
      localStorage.setItem(feedbackGivenKey(activityType, activityId), '1')
      setDone(true)
      // Give user a moment to read the thank-you, then proceed
      setTimeout(() => onSubmit?.(), 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const LikertScale = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="feedbackLikertRow">
      <label className="feedbackLikertLabel">{label}</label>
      <div className="feedbackLikertOptions">
        {[1, 2, 3, 4, 5].map(num => (
          <label key={num} className="feedbackLikertOption">
            <input
              type="radio"
              name={label}
              value={num}
              checked={value === num}
              onChange={() => onChange(num)}
            />
            <span>{num}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="feedbackFormOverlay">
      <div className="feedbackFormContainer">
        {done ? (
          <div className="feedbackDone">
            <span className="feedbackDoneIcon">✓</span>
            <h2>Thank you for your feedback!</h2>
            <p>Your response has been recorded. Loading your results…</p>
          </div>
        ) : (
          <>
            <h2>Share Your Feedback</h2>
            <p className="feedbackFormSubtitle">
              Your feedback helps improve this system — please answer honestly. This is for research purposes.
            </p>

            {submitError && (
              <div className="feedbackError">
                <strong>Could not submit:</strong> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Rating Scales */}
              <section className="feedbackFormSection">
                <h3>Rate Your Experience</h3>
                <p className="feedbackSectionHint">1 = Strongly Disagree, 5 = Strongly Agree</p>

                <LikertScale
                  label="This activity was easy to use and navigate"
                  value={scores.usability}
                  onChange={(val) => handleScoreChange('usability', val)}
                />
                <LikertScale
                  label="This content was relevant to cybercrime awareness"
                  value={scores.relevance}
                  onChange={(val) => handleScoreChange('relevance', val)}
                />
                <LikertScale
                  label="This content is practical for real-world scenarios"
                  value={scores.practicality}
                  onChange={(val) => handleScoreChange('practicality', val)}
                />
                <LikertScale
                  label="This activity was engaging and interesting"
                  value={scores.engagement}
                  onChange={(val) => handleScoreChange('engagement', val)}
                />
              </section>

              {/* Difficulty */}
              <section className="feedbackFormSection">
                <label className="feedbackLabel">
                  How would you rate the difficulty level?
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="feedbackSelect"
                >
                  <option value="">Select difficulty...</option>
                  <option value="too_easy">Too Easy</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                  <option value="too_difficult">Too Difficult</option>
                </select>
              </section>

              {/* Open Comment */}
              <section className="feedbackFormSection">
                <label className="feedbackLabel">
                  Additional Comments <span className="feedbackOptional">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share any specific feedback, suggestions, or observations..."
                  className="feedbackTextarea"
                  rows={4}
                />
              </section>

              {/* Recommendation */}
              <section className="feedbackFormSection">
                <label className="feedbackCheckbox">
                  <input
                    type="checkbox"
                    checked={recommend}
                    onChange={(e) => setRecommend(e.target.checked)}
                  />
                  <span>I would recommend this activity to other learners</span>
                </label>
              </section>

              {/* Buttons */}
              <div className="feedbackFormActions">
                <button
                  type="button"
                  onClick={() => {
                    // Mark as skipped so it won't show again
                    localStorage.setItem(feedbackGivenKey(activityType, activityId), '1')
                    onCancel?.()
                  }}
                  className="feedbackBtn secondary"
                  disabled={submitting}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="feedbackBtn primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
