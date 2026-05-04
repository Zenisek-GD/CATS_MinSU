/**
 * OBJECTIVE 4: Participant Perceptions & Usability Analysis
 * 
 * This document explains how to collect and analyze feedback for:
 * - Usability of the system
 * - Relevance to cybercrime awareness
 * - Practicality of simulation-based learning
 * - Participant perceptions and key themes
 */

// ============================================================================
// 1. COLLECTING FEEDBACK - User Side (React/Frontend)
// ============================================================================

import { FeedbackForm } from '../components/FeedbackForm'

// Example: Show feedback form after completing a quiz
export function QuizCompletionPage({ quizId }) {
  const [showFeedback, setShowFeedback] = useState(true)

  return (
    <>
      <div className="completionSection">
        <h1>Quiz Completed!</h1>
        <p>Great job! You scored 85%</p>
      </div>

      {showFeedback && (
        <FeedbackForm
          activityType="quiz"
          activityId={quizId}
          onSubmit={() => {
            setShowFeedback(false)
            // Navigate to next page
          }}
          onCancel={() => setShowFeedback(false)}
        />
      )}
    </>
  )
}

// ============================================================================
// 2. SUBMITTING FEEDBACK - JavaScript Fetch Example
// ============================================================================

const submitFeedback = async (feedbackData) => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      feedback_type: 'simulation',  // 'quiz', 'simulation', 'module', 'general'
      simulation_id: 5,
      usability_score: 4,           // 1-5 scale
      relevance_score: 5,
      practicality_score: 4,
      engagement_score: 5,
      comment: 'Very realistic phishing simulation!',
      perceived_difficulty: 'moderate',
      would_recommend: true,
    }),
  })

  const result = await response.json()
  console.log('Feedback submitted:', result)
}

// ============================================================================
// 3. ANALYZING FEEDBACK - Backend Admin API
// ============================================================================

/**
 * Get overall feedback analytics
 * GET /api/admin/feedback/analytics?type=simulation
 */
const fetchAnalytics = async () => {
  const response = await fetch('/api/admin/feedback/analytics?type=simulation', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  })

  const data = await response.json()
  console.log('Analytics:', {
    total_responses: data.total_responses,
    averages: {
      usability: data.averages.usability,        // 3.8 out of 5
      relevance: data.averages.relevance,
      practicality: data.averages.practicality,
      engagement: data.averages.engagement,
    },
    difficulty_distribution: {
      easy: 5,
      moderate: 12,
      difficult: 3,
    },
    recommendation_rate: data.recommendation_rate,  // 85%
    key_themes: {
      realistic: 8,
      practical: 7,
      engaging: 6,
    },
  })
}

// ============================================================================
// 4. COMPARING ACTIVITIES - Backend Admin API
// ============================================================================

/**
 * Compare feedback between different activities
 * GET /api/admin/feedback/comparison?type1=quiz&type2=simulation
 */
const compareActivities = async () => {
  const response = await fetch(
    '/api/admin/feedback/comparison?type1=quiz&type2=simulation',
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  )

  const comparison = await response.json()
  /*
  {
    "quiz": {
      "count": 45,
      "avg_usability": 3.8,
      "avg_relevance": 4.2,
      "avg_practicality": 3.5,
      "avg_engagement": 3.9,
      "recommendation_rate": 82.22
    },
    "simulation": {
      "count": 38,
      "avg_usability": 4.3,
      "avg_relevance": 4.7,
      "avg_practicality": 4.4,
      "avg_engagement": 4.6,
      "recommendation_rate": 92.11
    }
  }
  */
}

// ============================================================================
// 5. QUERYING FEEDBACK - Backend/Database
// ============================================================================

// Example Laravel/PHP usage
use App\Models\UserFeedback;

// Get all feedback for a specific simulation
$feedbackOnSim = UserFeedback::where('simulation_id', 5)->get();

// Get highly rated feedback (average >= 4)
$highlyRated = UserFeedback::get()
  ->filter(fn($f) => $f->getAverageRatingAttribute() >= 4);

// Get feedback with behavioral indicators
$withRecommendations = UserFeedback::where('would_recommend', true)
  ->where('practicality_score', '>=', 4)
  ->get();

// Extract comments for thematic analysis
$comments = UserFeedback::whereNotNull('comment')
  ->where('feedback_type', 'simulation')
  ->pluck('comment');

// Get difficulty distribution
$difficultyDist = UserFeedback::where('feedback_type', 'quiz')
  ->groupBy('perceived_difficulty')
  ->selectRaw('perceived_difficulty, count(*) as count')
  ->get();

// ============================================================================
// 6. RESEARCH ANALYSIS - Data for Objective 4
// ============================================================================

/**
 * Compile research report for Objective 4:
 * "Identify key themes and participant perceptions regarding the usability,
 *  relevance, and practicality of simulation-based learning"
 */

const generateResearchReport = async () => {
  // 1. Quantitative Data
  const quizData = await fetch('/api/admin/feedback/analytics?type=quiz').then(r => r.json())
  const simData = await fetch('/api/admin/feedback/analytics?type=simulation').then(r => r.json())
  const moduleData = await fetch('/api/admin/feedback/analytics?type=module').then(r => r.json())

  // 2. Comparison Data
  const comparison = await fetch('/api/admin/feedback/comparison?type1=quiz&type2=simulation').then(r => r.json())

  // 3. Collect all comments for thematic coding
  const allFeedback = [
    ...quizData.sample_comments,
    ...simData.sample_comments,
    ...moduleData.sample_comments,
  ]

  // 4. Key Findings
  const report = {
    // USABILITY
    usability: {
      quiz: quizData.averages.usability,           // Average score
      simulation: simData.averages.usability,
      module: moduleData.averages.usability,
      insight: 'Simulations rated higher for usability than traditional quizzes',
    },

    // RELEVANCE
    relevance: {
      quiz: quizData.averages.relevance,
      simulation: simData.averages.relevance,
      module: moduleData.averages.relevance,
      insight: 'Simulations perceived as most relevant to real cybercrime scenarios',
    },

    // PRACTICALITY
    practicality: {
      quiz: quizData.averages.practicality,
      simulation: simData.averages.practicality,
      module: moduleData.averages.practicality,
      insight: 'Interactive simulations viewed as most practical for real-world application',
    },

    // ENGAGEMENT
    engagement: {
      quiz: quizData.averages.engagement,
      simulation: simData.averages.engagement,
      module: moduleData.averages.engagement,
    },

    // RECOMMENDATION RATES
    recommendations: {
      quiz: quizData.recommendation_rate,
      simulation: simData.recommendation_rate,
      module: moduleData.recommendation_rate,
    },

    // KEY THEMES FROM COMMENTS
    themes: {
      positive: quizData.key_themes,
      negativeThemes: ['confusing', 'ineffective', 'difficult'],
    },

    // DIFFICULTY PERCEPTIONS
    difficulty_distribution: quizData.difficulty_distribution,

    // STATISTICAL COMPARISON
    effectiveness_comparison: comparison,
  }

  return report
}

// ============================================================================
// 7. BUILDING ANALYTICS DASHBOARD (Admin)
// ============================================================================

export function FeedbackDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [comparison, setComparison] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/feedback/analytics').then(r => r.json()),
      fetch('/api/admin/feedback/comparison?type1=quiz&type2=simulation').then(r => r.json()),
    ]).then(([analytics, comparison]) => {
      setAnalytics(analytics)
      setComparison(comparison)
    })
  }, [])

  if (!analytics) return <div>Loading...</div>

  return (
    <div className="feedbackDashboard">
      <h1>Feedback Analytics (Objective 4)</h1>

      {/* Usability Metrics */}
      <section className="dashboardSection">
        <h2>Usability Scores</h2>
        <div className="metricGrid">
          <div className="metric">
            <span className="label">Average Usability</span>
            <span className="value">{analytics.averages.usability.toFixed(2)}/5</span>
          </div>
          <div className="metric">
            <span className="label">Total Responses</span>
            <span className="value">{analytics.total_responses}</span>
          </div>
        </div>
      </section>

      {/* Relevance & Practicality */}
      <section className="dashboardSection">
        <h2>Cybercrime Awareness Effectiveness</h2>
        <div className="metricGrid">
          <div className="metric">
            <span className="label">Relevance</span>
            <span className="value">{analytics.averages.relevance.toFixed(2)}/5</span>
          </div>
          <div className="metric">
            <span className="label">Practicality</span>
            <span className="value">{analytics.averages.practicality.toFixed(2)}/5</span>
          </div>
        </div>
      </section>

      {/* Key Themes */}
      <section className="dashboardSection">
        <h2>Emerging Themes</h2>
        <ul>
          {Object.entries(analytics.key_themes).map(([theme, count]) => (
            <li key={theme}>{theme}: {count} mentions</li>
          ))}
        </ul>
      </section>

      {/* Recommendation Rate */}
      <section className="dashboardSection">
        <h2>Recommendation Rate</h2>
        <div className="progressBar">
          <div 
            className="progress" 
            style={{ width: `${analytics.recommendation_rate}%` }}
          />
          <span>{analytics.recommendation_rate.toFixed(1)}% would recommend</span>
        </div>
      </section>

      {/* Comparison */}
      <section className="dashboardSection">
        <h2>Quiz vs Simulation Effectiveness</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Quiz</th>
              <th>Simulation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Avg Usability</td>
              <td>{comparison.quiz.avg_usability}</td>
              <td>{comparison.simulation.avg_usability}</td>
            </tr>
            <tr>
              <td>Avg Relevance</td>
              <td>{comparison.quiz.avg_relevance}</td>
              <td>{comparison.simulation.avg_relevance}</td>
            </tr>
            <tr>
              <td>Recommendation Rate</td>
              <td>{comparison.quiz.recommendation_rate}%</td>
              <td>{comparison.simulation.recommendation_rate}%</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

// ============================================================================
// 8. EXPORTING DATA FOR RESEARCH
// ============================================================================

/**
 * Export feedback data as CSV for manual analysis in Excel/SPSS
 */
const exportFeedbackCSV = async () => {
  const response = await fetch('/api/admin/feedback')
  const allFeedback = await response.json()

  const csv = [
    ['User ID', 'Activity Type', 'Usability', 'Relevance', 'Practicality', 'Engagement', 'Difficulty', 'Recommend', 'Comment', 'Date'],
    ...allFeedback.map(f => [
      f.user_id,
      f.feedback_type,
      f.usability_score || '',
      f.relevance_score || '',
      f.practicality_score || '',
      f.engagement_score || '',
      f.perceived_difficulty || '',
      f.would_recommend ? 'Yes' : 'No',
      `"${(f.comment || '').replace(/"/g, '""')}"`,
      new Date(f.created_at).toLocaleDateString(),
    ]),
  ]

  const csvContent = csv.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feedback_export.csv'
  a.click()
}
