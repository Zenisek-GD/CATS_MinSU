import { api } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────
export type TcTopic = { id: number; training_module_id: number; title: string; content: string; sort_order: number }
export type TcModule = { id: number; title: string; description: string | null; is_active: boolean; quiz_id: number | null; created_by: number; topics?: TcTopic[]; quiz?: { id: number; title: string } }

export type TcOption = { id?: number; label: string; text: string; is_correct: boolean; sort_order?: number }
export type TcQuestion = { id: number; quiz_id: number; type: string; prompt: string; scenario?: string | null; explanation?: string | null; points: number; sort_order: number; options: TcOption[] }
export type TcQuiz = { id: number; category_id: number; title: string; description: string | null; kind: string; difficulty: string; time_limit_seconds: number | null; is_active: boolean; created_by: number; questions_count?: number; category?: { id: number; slug: string; name: string } }

export type TcChoice = { id: number; step_id: number; next_step_id: number | null; text: string; is_safe: boolean; score_delta: number; feedback: string | null; explanation: string | null; sort_order: number }
export type TcStep = { id: number; simulation_id: number; step_order: number; title: string; prompt: string; education: string | null; choices: TcChoice[] }
export type TcSimulation = { id: number; category_id: number; title: string; description: string | null; difficulty: string; time_limit_seconds: number | null; max_score: number; is_active: boolean; created_by: number; steps?: TcStep[]; category?: { id: number; slug: string; name: string } }

export type TcCategory = { id: number; slug: string; name: string }

const BASE = '/api/teacher/content'

// ─── Categories ─────────────────────────────────────────────────────────────
export async function tcGetCategories(): Promise<{ categories: TcCategory[] }> {
  const r = await api.get(`${BASE}/categories`); return r.data
}

// ─── Modules ─────────────────────────────────────────────────────────────────
export async function tcGetModules(): Promise<{ modules: TcModule[] }> {
  const r = await api.get(`${BASE}/modules`); return r.data
}
export async function tcCreateModule(data: { title: string; description?: string; is_active?: boolean; quiz_id?: number | null }): Promise<{ module: TcModule }> {
  const r = await api.post(`${BASE}/modules`, data); return r.data
}
export async function tcUpdateModule(id: number, data: Partial<{ title: string; description: string | null; is_active: boolean; quiz_id: number | null }>): Promise<{ module: TcModule }> {
  const r = await api.patch(`${BASE}/modules/${id}`, data); return r.data
}
export async function tcDeleteModule(id: number): Promise<void> {
  await api.delete(`${BASE}/modules/${id}`)
}
export async function tcCreateTopic(moduleId: number, data: { title: string; content: string; sort_order?: number }): Promise<{ topic: TcTopic }> {
  const r = await api.post(`${BASE}/modules/${moduleId}/topics`, data); return r.data
}
export async function tcUpdateTopic(topicId: number, data: Partial<{ title: string; content: string; sort_order: number }>): Promise<{ topic: TcTopic }> {
  const r = await api.patch(`${BASE}/module-topics/${topicId}`, data); return r.data
}
export async function tcDeleteTopic(topicId: number): Promise<void> {
  await api.delete(`${BASE}/module-topics/${topicId}`)
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export async function tcGetQuizzes(): Promise<{ quizzes: TcQuiz[] }> {
  const r = await api.get(`${BASE}/quizzes`); return r.data
}
export async function tcCreateQuiz(data: { category_id: number; title: string; description?: string; kind: string; difficulty: string; time_limit_seconds?: number | null; is_active?: boolean }): Promise<{ quiz: TcQuiz }> {
  const r = await api.post(`${BASE}/quizzes`, data); return r.data
}
export async function tcUpdateQuiz(id: number, data: Partial<{ category_id: number; title: string; description: string | null; kind: string; difficulty: string; time_limit_seconds: number | null; is_active: boolean }>): Promise<{ quiz: TcQuiz }> {
  const r = await api.patch(`${BASE}/quizzes/${id}`, data); return r.data
}
export async function tcDeleteQuiz(id: number): Promise<void> {
  await api.delete(`${BASE}/quizzes/${id}`)
}

// ─── Questions ───────────────────────────────────────────────────────────────
export async function tcGetQuestions(quizId?: number): Promise<{ questions: TcQuestion[] }> {
  const r = await api.get(`${BASE}/questions`, { params: quizId ? { quiz_id: quizId } : {} }); return r.data
}
export async function tcCreateQuestion(data: { quiz_id: number; type: string; prompt: string; scenario?: string; explanation?: string; points: number; options: TcOption[] }): Promise<{ question: TcQuestion }> {
  const r = await api.post(`${BASE}/questions`, data); return r.data
}
export async function tcUpdateQuestion(id: number, data: Partial<{ type: string; prompt: string; scenario: string | null; explanation: string | null; points: number; options: TcOption[] }>): Promise<{ question: TcQuestion }> {
  const r = await api.patch(`${BASE}/questions/${id}`, data); return r.data
}
export async function tcDeleteQuestion(id: number): Promise<void> {
  await api.delete(`${BASE}/questions/${id}`)
}

// ─── Simulations ─────────────────────────────────────────────────────────────
export async function tcGetSimulations(): Promise<{ simulations: TcSimulation[] }> {
  const r = await api.get(`${BASE}/simulations`); return r.data
}
export async function tcCreateSimulation(data: { category_id: number; title: string; description?: string; difficulty: string; time_limit_seconds?: number | null; max_score?: number; is_active?: boolean }): Promise<{ simulation: TcSimulation }> {
  const r = await api.post(`${BASE}/simulations`, data); return r.data
}
export async function tcUpdateSimulation(id: number, data: Partial<{ title: string; description: string | null; difficulty: string; time_limit_seconds: number | null; max_score: number; is_active: boolean; category_id: number }>): Promise<{ simulation: TcSimulation }> {
  const r = await api.patch(`${BASE}/simulations/${id}`, data); return r.data
}
export async function tcDeleteSimulation(id: number): Promise<void> {
  await api.delete(`${BASE}/simulations/${id}`)
}
export async function tcCreateStep(simId: number, data: { title: string; prompt: string; education?: string; step_order?: number }): Promise<{ step: TcStep }> {
  const r = await api.post(`${BASE}/simulations/${simId}/steps`, data); return r.data
}
export async function tcUpdateStep(stepId: number, data: Partial<{ title: string; prompt: string; education: string | null; step_order: number }>): Promise<{ step: TcStep }> {
  const r = await api.patch(`${BASE}/simulation-steps/${stepId}`, data); return r.data
}
export async function tcDeleteStep(stepId: number): Promise<void> {
  await api.delete(`${BASE}/simulation-steps/${stepId}`)
}
export async function tcCreateChoice(stepId: number, data: { text: string; is_safe: boolean; score_delta: number; feedback?: string; explanation?: string; next_step_id?: number | null; sort_order?: number }): Promise<{ choice: TcChoice }> {
  const r = await api.post(`${BASE}/simulation-steps/${stepId}/choices`, data); return r.data
}
export async function tcUpdateChoice(choiceId: number, data: Partial<{ text: string; is_safe: boolean; score_delta: number; feedback: string | null; explanation: string | null; next_step_id: number | null; sort_order: number }>): Promise<{ choice: TcChoice }> {
  const r = await api.patch(`${BASE}/simulation-choices/${choiceId}`, data); return r.data
}
export async function tcDeleteChoice(choiceId: number): Promise<void> {
  await api.delete(`${BASE}/simulation-choices/${choiceId}`)
}
