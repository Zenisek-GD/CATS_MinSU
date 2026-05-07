import { api } from './client'

/* ─── Modules ─── */
export type AdminModuleTopic = { id: number; training_module_id: number; title: string; content: string; sort_order: number; created_at?: string }
export type AdminModule = { id: number; title: string; description: string | null; is_active: boolean; quiz_id: number | null; created_at?: string; topics?: AdminModuleTopic[]; quiz?: { id: number; title: string } }

export async function adminGetModules(): Promise<{ modules: AdminModule[] }> {
  const r = await api.get('/api/admin/modules'); return r.data as { modules: AdminModule[] }
}
export async function adminCreateModule(data: { title: string; description?: string; is_active?: boolean; quiz_id?: number | null }): Promise<{ module: AdminModule }> {
  const r = await api.post('/api/admin/modules', data); return r.data as { module: AdminModule }
}
export async function adminUpdateModule(id: number, data: Partial<{ title: string; description: string | null; is_active: boolean; quiz_id: number | null }>): Promise<{ module: AdminModule }> {
  const r = await api.patch(`/api/admin/modules/${id}`, data); return r.data as { module: AdminModule }
}
export async function adminDeleteModule(id: number): Promise<void> {
  await api.delete(`/api/admin/modules/${id}`)
}

/* ─── Module Topics ─── */
export async function adminCreateModuleTopic(moduleId: number, data: { title: string; content: string; sort_order?: number }): Promise<{ topic: AdminModuleTopic }> {
  const r = await api.post(`/api/admin/modules/${moduleId}/topics`, data); return r.data as { topic: AdminModuleTopic }
}
export async function adminUpdateModuleTopic(topicId: number, data: Partial<{ title: string; content: string; sort_order: number }>): Promise<{ topic: AdminModuleTopic }> {
  const r = await api.patch(`/api/admin/module-topics/${topicId}`, data); return r.data as { topic: AdminModuleTopic }
}
export async function adminDeleteModuleTopic(topicId: number): Promise<void> {
  await api.delete(`/api/admin/module-topics/${topicId}`)
}

/* ─── Questions ─── */
export type AdminOption = { id?: number; label: string; text: string; is_correct: boolean; sort_order?: number }
export type AdminQuestion = {
  id: number; quiz_id: number; type: string; prompt: string; scenario?: string | null
  explanation?: string | null; points: number; sort_order: number
  options: AdminOption[]
  quiz?: { id: number; title: string; category?: { id: number; slug: string; name: string } | null }
}

export async function adminGetQuestions(quizId?: number): Promise<{ questions: AdminQuestion[] }> {
  const params = quizId ? { quiz_id: quizId } : {}
  const r = await api.get('/api/admin/questions', { params }); return r.data as { questions: AdminQuestion[] }
}
export async function adminCreateQuestion(data: {
  quiz_id: number; type: string; prompt: string; scenario?: string; explanation?: string
  points: number; sort_order?: number; options: AdminOption[]
}): Promise<{ question: AdminQuestion }> {
  const r = await api.post('/api/admin/questions', data); return r.data as { question: AdminQuestion }
}
export async function adminUpdateQuestion(id: number, data: Partial<{
  type: string; prompt: string; scenario: string | null; explanation: string | null
  points: number; sort_order: number; options: AdminOption[]
}>): Promise<{ question: AdminQuestion }> {
  const r = await api.patch(`/api/admin/questions/${id}`, data); return r.data as { question: AdminQuestion }
}
export async function adminDeleteQuestion(id: number): Promise<void> {
  await api.delete(`/api/admin/questions/${id}`)
}

/* ─── Simulations ─── */
export type AdminChoice = {
  id: number; step_id: number; next_step_id: number | null; text: string
  is_safe: boolean; score_delta: number; feedback: string | null; explanation: string | null; sort_order: number
}
export type AdminStep = {
  id: number; simulation_id: number; step_order: number; title: string; prompt: string
  education: string | null; choices: AdminChoice[]
}
export type AdminSimulation = {
  id: number; category_id: number; title: string; description: string | null
  difficulty: string; time_limit_seconds: number | null; max_score: number; is_active: boolean
  category?: { id: number; slug: string; name: string } | null; steps?: AdminStep[]
  videos?: import('./simulations').ApiSimulationVideo[]
}

export async function adminGetSimulations(): Promise<{ simulations: AdminSimulation[] }> {
  const r = await api.get('/api/admin/simulations'); return r.data as { simulations: AdminSimulation[] }
}
export async function adminCreateSimulation(data: {
  category_id: number; title: string; description?: string; difficulty: string
  time_limit_seconds?: number; max_score: number; is_active?: boolean
}): Promise<{ simulation: AdminSimulation }> {
  const r = await api.post('/api/admin/simulations', data); return r.data as { simulation: AdminSimulation }
}
export async function adminUpdateSimulation(id: number, data: Partial<{
  title: string; description: string | null; difficulty: string
  time_limit_seconds: number | null; max_score: number; is_active: boolean; category_id: number
}>): Promise<{ simulation: AdminSimulation }> {
  const r = await api.patch(`/api/admin/simulations/${id}`, data); return r.data as { simulation: AdminSimulation }
}
export async function adminDeleteSimulation(id: number): Promise<void> {
  await api.delete(`/api/admin/simulations/${id}`)
}

/* Steps */
export async function adminCreateStep(simId: number, data: {
  title: string; prompt: string; education?: string; step_order?: number
}): Promise<{ step: AdminStep }> {
  const r = await api.post(`/api/admin/simulations/${simId}/steps`, data); return r.data as { step: AdminStep }
}
export async function adminUpdateStep(stepId: number, data: Partial<{
  title: string; prompt: string; education: string | null; step_order: number
}>): Promise<{ step: AdminStep }> {
  const r = await api.patch(`/api/admin/simulation-steps/${stepId}`, data); return r.data as { step: AdminStep }
}
export async function adminDeleteStep(stepId: number): Promise<void> {
  await api.delete(`/api/admin/simulation-steps/${stepId}`)
}

/* Choices */
export async function adminCreateChoice(stepId: number, data: {
  text: string; is_safe: boolean; score_delta: number; feedback?: string
  explanation?: string; next_step_id?: number | null; sort_order?: number
}): Promise<{ choice: AdminChoice }> {
  const r = await api.post(`/api/admin/simulation-steps/${stepId}/choices`, data); return r.data as { choice: AdminChoice }
}
export async function adminUpdateChoice(choiceId: number, data: Partial<{
  text: string; is_safe: boolean; score_delta: number; feedback: string | null
  explanation: string | null; next_step_id: number | null; sort_order: number
}>): Promise<{ choice: AdminChoice }> {
  const r = await api.patch(`/api/admin/simulation-choices/${choiceId}`, data); return r.data as { choice: AdminChoice }
}
export async function adminDeleteChoice(choiceId: number): Promise<void> {
  await api.delete(`/api/admin/simulation-choices/${choiceId}`)
}
