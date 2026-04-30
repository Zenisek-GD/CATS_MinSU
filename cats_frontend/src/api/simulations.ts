import { api } from './client'

export type ApiCategory = {
  id: number
  slug: string
  name: string
}

export type SimulationDifficulty = 'easy' | 'medium' | 'hard'

export type ApiSimulation = {
  id: number
  title: string
  description: string | null
  difficulty: SimulationDifficulty
  time_limit_seconds: number | null
  max_score: number
  category: ApiCategory | null
}

export type ApiSimulationChoice = {
  id: number
  text: string
}

export type ApiSimulationStep = {
  id: number
  title: string | null
  prompt: string
  education: string | null
  choices: ApiSimulationChoice[]
}

export type ApiSimulationRun = {
  id: number
  status: 'in_progress' | 'completed' | 'expired'
  score: number
  max_score: number
  started_at: string | null
  finished_at: string | null
  time_limit_seconds: number | null
  simulation: ApiSimulation
  current_step: ApiSimulationStep | null
  stats?: {
    safe_choices: number
    unsafe_choices: number
  }
}

export type ApiSimulationOutcome = {
  choice_id?: number
  is_safe?: boolean
  score_delta?: number
  feedback?: string | null
  explanation?: string | null
  message?: string
}

export async function getSimulations(params?: {
  category?: string
  difficulty?: SimulationDifficulty
}): Promise<{ simulations: ApiSimulation[] }> {
  const resp = await api.get('/api/simulations', { params })
  return resp.data as { simulations: ApiSimulation[] }
}

export async function startSimulationRun(simulationId: number): Promise<{ run: ApiSimulationRun }> {
  const resp = await api.post(`/api/simulations/${simulationId}/runs`)
  return resp.data as { run: ApiSimulationRun }
}

export async function getSimulationRun(runId: number): Promise<{ run: ApiSimulationRun }> {
  const resp = await api.get(`/api/simulation-runs/${runId}`)
  return resp.data as { run: ApiSimulationRun }
}

export async function chooseSimulation(runId: number, choiceId: number): Promise<{ run: ApiSimulationRun; outcome: ApiSimulationOutcome }> {
  const resp = await api.post(`/api/simulation-runs/${runId}/choose`, { choice_id: choiceId })
  return resp.data as { run: ApiSimulationRun; outcome: ApiSimulationOutcome }
}
