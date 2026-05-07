import { api } from './client'

export type ApiQuizCategory = {
  id: number
  slug: string
  name: string
}

export type QuizKind = 'regular' | 'pretest' | 'posttest'
export type QuizDifficulty = 'easy' | 'medium' | 'hard'

export type ApiQuiz = {
  id: number
  category_id?: number
  title: string
  description: string | null
  difficulty: QuizDifficulty
  kind: QuizKind
  randomize_questions: boolean
  question_count: number
  time_limit_seconds: number | null
  created_at?: string
  category: ApiQuizCategory | null
}

export type ApiQuizOption = {
  id: number
  label: string | null
  text: string | null
}

export type ApiQuizQuestion = {
  id: number
  type: string
  prompt: string
  scenario: string | null
  points: number
  options: ApiQuizOption[]
}

export type ApiQuizAttempt = {
  id: number
  status: 'in_progress' | 'completed' | 'expired'
  score: number
  max_score: number
  percent: number
  started_at: string | null
  finished_at: string | null
  time_limit_seconds: number | null
  quiz: {
    id: number
    title: string
    description?: string | null
    difficulty: QuizDifficulty
    kind: QuizKind
    category: ApiQuizCategory | null
  }
  questions: ApiQuizQuestion[]
}

export type ApiQuizAttemptResult = {
  question_id: number
  prompt: string
  scenario: string | null
  is_correct: boolean
  earned_points: number
  points: number
  explanation: string | null
  correct_option: { id: number; label: string | null; text: string | null } | null
  selected_option: { id: number; label: string | null; text: string | null } | null
  selected_option_id: number | null
}

export type ApiQuizAttemptFeedback = {
  risk_level: 'low' | 'medium' | 'high'
  tips: string[]
  recommendations: Array<
    | { type: 'training_module'; title: string; module_id: number; reason: string }
    | { type: 'tip'; title: string; reason: string }
  >
  stats?: {
    recent_total: number
    recent_incorrect: number
  }
}

export type ApiAiFeedback = {
  summary: string
  red_flags: string[]
  what_to_do_next: string
}

export async function getQuizCategories(): Promise<{ categories: ApiQuizCategory[] }> {
  const resp = await api.get('/api/quiz/categories')
  return resp.data as { categories: ApiQuizCategory[] }
}

export async function getQuizzes(params?: {
  category?: string
  kind?: QuizKind
  difficulty?: QuizDifficulty
}): Promise<{ quizzes: ApiQuiz[] }> {
  const resp = await api.get('/api/quizzes', { params })
  return resp.data as { quizzes: ApiQuiz[] }
}

export async function startQuizAttempt(quizId: number): Promise<{ attempt: ApiQuizAttempt }> {
  const resp = await api.post(`/api/quizzes/${quizId}/attempts`)
  return resp.data as { attempt: ApiQuizAttempt }
}

export async function getQuizAttempt(attemptId: number): Promise<{ attempt: ApiQuizAttempt }> {
  const resp = await api.get(`/api/quiz-attempts/${attemptId}`)
  return resp.data as { attempt: ApiQuizAttempt }
}

export async function submitQuizAttempt(
  attemptId: number,
  payload: {
    answers: Array<{ question_id: number; selected_option_id: number | null }>
  },
): Promise<{
  attempt: Omit<ApiQuizAttempt, 'questions'>
  results: ApiQuizAttemptResult[]
  feedback: ApiQuizAttemptFeedback
  ai_feedback?: ApiAiFeedback | null
}> {
  const resp = await api.post(`/api/quiz-attempts/${attemptId}/submit`, payload)
  return resp.data as {
    attempt: Omit<ApiQuizAttempt, 'questions'>
    results: ApiQuizAttemptResult[]
    feedback: ApiQuizAttemptFeedback
    ai_feedback?: ApiAiFeedback | null
  }
}

export type AttemptSummary = {
  attempt_id: number
  score: number
  max_score: number
  percent: number
  finished_at: string | null
}

/** Returns best completed attempt per quiz keyed by quiz_id string */
export async function getMyQuizAttempts(): Promise<Record<string, AttemptSummary>> {
  const resp = await api.get('/api/my-quiz-attempts')
  return (resp.data as { attempts: Record<string, AttemptSummary> }).attempts
}
