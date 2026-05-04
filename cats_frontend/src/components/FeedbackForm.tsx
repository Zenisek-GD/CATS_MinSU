import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import '../styles/FeedbackForm.css'

interface FeedbackFormProps {
  activityType: 'quiz' | 'simulation' | 'module' | 'general'
  activityId?: number
  onSubmit?: () => void
  onCancel?: () => void
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

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Build payload with correct field mapping
      const payload: any = {
        feedback_type: activityType,
        usability_score: scores.usability > 0 ? scores.usability : null,
        relevance_score: scores.relevance > 0 ? scores.relevance : null,
        practicality_score: scores.practicality > 0 ? scores.practicality : null,
        engagement_score: scores.engagement > 0 ? scores.engagement : null,
        comment: comment.trim() || null,
        perceived_difficulty: difficulty || null,
        would_recommend: recommend,
      }

      // Add activity ID with correct field name
      if (activityType === 'quiz' && activityId) {
        payload.quiz_id = activityId
      } else if (activityType === 'simulation' && activityId) {
        payload.simulation_id = activityId
      } else if (activityType === 'module' && activityId) {
        payload.training_module_id = activityId
      }

      console.log('Feedback payload:', payload)

      if (!token) {
        throw new Error('Not authenticated - Please log in again')
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP ${response.status} ${response.statusText}` }
        }
        
        // Log validation errors if they exist
        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors)
        }
        
        throw new Error(errorData?.message || errorData?.errors?.join(', ') || `HTTP ${response.status}`)
      }

      alert('Thank you for your feedback!')
      onSubmit?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Feedback submission error:', message)
      alert(`Error submitting feedback: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const LikertScale = ({ label, value, onChange }: any) => (
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
        <h2>Share Your Feedback</h2>
        <p className="feedbackFormSubtitle">Help us improve by sharing your experience</p>

        <form onSubmit={handleSubmit}>
          {/* Rating Scales */}
          <section className="feedbackFormSection">
            <h3>Rate Your Experience</h3>
            <p className="feedbackSectionHint">1 = Strongly Disagree, 5 = Strongly Agree</p>

            <LikertScale
              label="This activity was easy to use and navigate"
              value={scores.usability}
              onChange={(val: number) => handleScoreChange('usability', val)}
            />
            <LikertScale
              label="This content was relevant to cybercrime awareness"
              value={scores.relevance}
              onChange={(val: number) => handleScoreChange('relevance', val)}
            />
            <LikertScale
              label="This content is practical for real-world scenarios"
              value={scores.practicality}
              onChange={(val: number) => handleScoreChange('practicality', val)}
            />
            <LikertScale
              label="This activity was engaging and interesting"
              value={scores.engagement}
              onChange={(val: number) => handleScoreChange('engagement', val)}
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
              Additional Comments (Optional)
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
              onClick={onCancel}
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
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
