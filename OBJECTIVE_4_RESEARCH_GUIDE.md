# Objective 4: Participant Perceptions & Usability Research Guide

## Overview

Objective 4 focuses on:

> "Identify key themes and participant perceptions regarding the usability, relevance, and practicality of simulation-based learning in cybercrime awareness"

This guide explains how to use the new `UserFeedback` model and API endpoints to collect, analyze, and report on participant feedback.

---

## What Gets Measured

### 1. **Usability** (5-point Likert scale)

- "This activity was easy to use and navigate"
- Measures user interface effectiveness and accessibility

### 2. **Relevance** (5-point Likert scale)

- "This content was relevant to cybercrime awareness"
- Measures alignment with learning objectives

### 3. **Practicality** (5-point Likert scale)

- "This content is practical for real-world scenarios"
- Measures applicability to actual cybersecurity situations

### 4. **Engagement** (5-point Likert scale)

- "This activity was engaging and interesting"
- Measures learner interest and motivation

### 5. **Difficulty Perception** (categorical)

- Too Easy / Easy / Moderate / Difficult / Too Difficult
- Helps calibrate content difficulty

### 6. **Recommendation** (yes/no)

- "I would recommend this to others"
- Overall satisfaction indicator

### 7. **Comments** (open-ended text)

- Qualitative feedback for thematic analysis
- Captured and analyzed for emerging themes

---

## Implementation Flow

### Phase 1: Data Collection

#### A. Show Feedback Form After Activity Completion

```tsx
// After quiz completion
import { FeedbackForm } from "../components/FeedbackForm";

export function QuizResultsPage({ quizId, score }) {
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  return (
    <>
      <div className="resultsCard">
        <h1>Quiz Complete!</h1>
        <p>Your Score: {score}%</p>
      </div>

      {feedbackOpen && (
        <FeedbackForm
          activityType="quiz"
          activityId={quizId}
          onSubmit={() => setFeedbackOpen(false)}
          onCancel={() => setFeedbackOpen(false)}
        />
      )}
    </>
  );
}
```

#### B. Optional: Mid-Activity Check-In

After simulations, allow feedback capture:

```tsx
// After simulation
<FeedbackForm
  activityType="simulation"
  activityId={simulationId}
  onSubmit={handleNext}
/>
```

### Phase 2: Data Storage & Organization

**Database tables created:**

- `user_feedback` - Raw feedback responses
- `learning_outcomes` - Paired with performance metrics

**Relationships:**

```
User (1) → (many) UserFeedback
User (1) → (many) LearningOutcome
Quiz (1) → (many) UserFeedback
Simulation (1) → (many) UserFeedback
TrainingModule (1) → (many) UserFeedback
```

### Phase 3: Analysis & Reporting

#### A. Quantitative Analysis (Averages & Distributions)

```php
// Get all feedback aggregates
$analytics = [
  'total_responses' => 156,
  'averages' => [
    'usability' => 4.1,
    'relevance' => 4.6,
    'practicality' => 4.3,
    'engagement' => 4.4,
  ],
  'difficulty_distribution' => [
    'too_easy' => 5,
    'easy' => 12,
    'moderate' => 95,
    'difficult' => 38,
    'too_difficult' => 6,
  ],
  'recommendation_rate' => 87.18,
];
```

#### B. Comparative Analysis (Quiz vs Simulation)

```php
// Compare learning method effectiveness
$comparison = [
  'quiz' => [
    'count' => 78,
    'avg_usability' => 3.8,
    'avg_relevance' => 4.0,
    'avg_practicality' => 3.5,
    'avg_engagement' => 3.9,
    'recommendation_rate' => 79.49,
  ],
  'simulation' => [
    'count' => 78,
    'avg_usability' => 4.4,
    'avg_relevance' => 5.0,
    'avg_practicality' => 4.8,
    'avg_engagement' => 4.9,
    'recommendation_rate' => 94.87,
  ],
];

// KEY INSIGHT: Simulations significantly outperform quizzes
// in relevance (+1.0), practicality (+1.3), and engagement (+1.0)
```

#### C. Thematic Analysis (Qualitative)

The system performs automatic keyword extraction:

```json
{
  "themes": {
    "positive": {
      "practical": 23,
      "realistic": 19,
      "engaging": 18,
      "relevant": 16,
      "helpful": 14
    },
    "negative": {
      "confusing": 2,
      "difficult": 5,
      "ineffective": 1
    }
  }
}
```

---

## API Endpoints Reference

### User Endpoints

#### 1. Submit Feedback

```
POST /api/feedback
Headers: Authorization: Bearer {token}
Body: {
  feedback_type: 'quiz' | 'simulation' | 'module' | 'general',
  quiz_id?: number,
  simulation_id?: number,
  training_module_id?: number,
  usability_score?: 1-5,
  relevance_score?: 1-5,
  practicality_score?: 1-5,
  engagement_score?: 1-5,
  comment?: string,
  perceived_difficulty?: 'too_easy' | 'easy' | 'moderate' | 'difficult' | 'too_difficult',
  would_recommend?: boolean
}
```

#### 2. Retrieve Your Feedback

```
GET /api/feedback?feedback_type=simulation&date_from=2024-01-01&date_to=2024-12-31
Headers: Authorization: Bearer {token}
```

### Admin Endpoints

#### 1. View Feedback Analytics

```
GET /api/admin/feedback/analytics?type=simulation
Headers: Authorization: Bearer {admin_token}

Response: {
  total_responses: 156,
  averages: { usability, relevance, practicality, engagement },
  difficulty_distribution: { ... },
  recommendation_rate: 87.18,
  key_themes: { ... },
  sample_comments: [...]
}
```

#### 2. Compare Activities

```
GET /api/admin/feedback/comparison?type1=quiz&type2=simulation
Headers: Authorization: Bearer {admin_token}

Response: {
  quiz: { count, avg_usability, avg_relevance, ... },
  simulation: { count, avg_usability, avg_relevance, ... }
}
```

---

## Research Report Generation

### Report Structure for Objective 4

```markdown
# Objective 4: Participant Perceptions Analysis Report

## Executive Summary

- Total participants: 156
- Response rate: 92%
- Overall satisfaction: 87.18% would recommend

## 1. USABILITY FINDINGS

- Average usability score: 4.1/5 (82%)
- Simulations rated higher: 4.4 vs Quizzes: 3.8
- Implication: Interactive simulations easier to navigate

## 2. RELEVANCE TO CYBERCRIME AWARENESS

- Average relevance score: 4.6/5 (92%)
- Simulations: 5.0 (highest possible)
- Quizzes: 4.0
- Implication: Simulation scenarios perceived as highly relevant to real cyber threats

## 3. PRACTICALITY FOR REAL-WORLD APPLICATION

- Average practicality score: 4.3/5 (86%)
- Simulations: 4.8 vs Quizzes: 3.5
- Implication: Participants see simulation learning as most applicable to actual work

## 4. ENGAGEMENT & INTEREST

- Average engagement score: 4.4/5 (88%)
- Simulations: 4.9 vs Quizzes: 3.9
- Implication: Simulation-based learning significantly more engaging

## 5. KEY THEMES IDENTIFIED

From participant comments:

**Positive Themes:**

- Realistic scenarios (19 mentions)
- Practical application (23 mentions)
- Highly engaging (18 mentions)
- Relevant to cybercrime (16 mentions)

**Areas for Improvement:**

- Some participants found certain simulations difficult (5 mentions)
- A few topics were perceived as confusing (2 mentions)

## 6. DIFFICULTY CALIBRATION

- 61% found content "just right" (moderate difficulty)
- 27% found content easy
- 12% found content difficult
- <5% found content too difficult or too easy
- Implication: Good difficulty balance overall

## 7. RECOMMENDATION RATES

- 87.18% would recommend this activity
- Simulations: 94.87% recommendation rate
- Quizzes: 79.49% recommendation rate
- Implication: High satisfaction, especially with simulations

## 8. CONCLUSIONS

1. Simulation-based learning significantly outperforms traditional quizzes
   across all measured dimensions
2. Participants perceive the interactive system as highly relevant
   to real cybercrime scenarios
3. Usability is strong, but could be improved in quiz interface
4. Engagement is excellent, particularly with simulations
5. Content difficulty is well-calibrated for target audience

## 9. RECOMMENDATIONS

1. Prioritize simulation-based content for cybercrime awareness
2. Investigate quiz UI improvements for better usability
3. Maintain current difficulty levels
4. Expand simulation scenarios based on participant feedback
5. Consider peer-to-peer recommendation features (high satisfaction)
```

---

## Data Export for External Analysis

Export data for qualitative analysis in NVivo, ATLAS.ti, or Dedoose:

```javascript
// Export as CSV
GET /api/feedback/export?format=csv

// Export as JSON for Qualitative Data Analysis
GET /api/feedback/export?format=json&include_comments=true
```

---

## Research Workflow

### Week 1: Baseline Collection

- Deploy feedback form for first cohort
- Collect ~50-100 responses
- Analyze patterns

### Week 2-4: Scale Collection

- Continue feedback collection across all participants
- Monitor emerging themes
- Track difficulty feedback

### Week 5-6: Comparative Analysis

- Compare quiz vs simulation responses
- Identify significant differences
- Prepare mid-point report

### Week 7-8: Final Analysis

- Compile all feedback data
- Perform thematic coding of comments
- Generate final research report
- Export data for peer review

---

## Integration Checklist

- [ ] `UserFeedback` model created ✓
- [ ] `FeedbackController` created ✓
- [ ] API routes configured ✓
- [ ] Frontend `FeedbackForm` component created ✓
- [ ] CSS styling added ✓
- [ ] Admin analytics endpoints working
- [ ] Feedback display after quiz completion
- [ ] Feedback display after simulation completion
- [ ] Feedback display after module completion
- [ ] Admin dashboard pulling analytics
- [ ] CSV export functionality
- [ ] Documentation shared with research team

---

## Support

For questions about feedback implementation:

1. Check `/OBJECTIVE_4_USAGE_GUIDE.js` for code examples
2. Review API endpoints in `routes/api.php`
3. Examine `FeedbackController.php` for analytics logic
4. Test endpoints in Postman or similar tool
