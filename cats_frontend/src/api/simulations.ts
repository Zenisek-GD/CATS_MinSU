import { api } from './client'

export type ApiCategory = {
  id: number
  slug: string
  name: string
}

export type SimulationDifficulty = 'easy' | 'medium' | 'hard'

export type ApiSimulationVideo = {
  id: number
  simulation_id: number
  title: string
  description: string | null
  video_url: string | null
  video_path: string | null
  playback_url: string | null
  sort_order: number
}

export type SimRunSummary = {
  run_id: number
  score: number
  max_score: number
  percent: number
  finished_at: string | null
}

export type ApiSimulation = {
  id: number
  title: string
  description: string | null
  difficulty: SimulationDifficulty
  time_limit_seconds: number | null
  max_score: number
  category: ApiCategory | null
  videos?: ApiSimulationVideo[]
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
  ai_feedback?: {
    summary: string
    red_flags: string[]
    what_to_do_next: string
  } | null
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

// ─── Admin Video API ───

export async function adminGetSimulationVideos(simId: number): Promise<{ videos: ApiSimulationVideo[] }> {
  const resp = await api.get(`/api/admin/simulations/${simId}/videos`)
  return resp.data
}

export async function adminAddSimulationVideo(
  simId: number,
  data: { title: string; description?: string; video_url?: string; video_file?: File; sort_order?: number }
): Promise<{ video: ApiSimulationVideo }> {
  const form = new FormData()
  form.append('title', data.title)
  if (data.description) form.append('description', data.description)
  if (data.video_url) form.append('video_url', data.video_url)
  if (data.video_file) form.append('video_file', data.video_file)
  if (data.sort_order !== undefined) form.append('sort_order', String(data.sort_order))
  const resp = await api.post(`/api/admin/simulations/${simId}/videos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data
}

export async function adminUpdateSimulationVideo(
  videoId: number,
  data: { title?: string; description?: string; video_url?: string; video_file?: File; sort_order?: number }
): Promise<{ video: ApiSimulationVideo }> {
  const form = new FormData()
  if (data.title) form.append('title', data.title)
  if (data.description !== undefined) form.append('description', data.description)
  if (data.video_url !== undefined) form.append('video_url', data.video_url)
  if (data.video_file) form.append('video_file', data.video_file)
  if (data.sort_order !== undefined) form.append('sort_order', String(data.sort_order))
  // Laravel PATCH with FormData needs method spoofing
  form.append('_method', 'PATCH')
  const resp = await api.post(`/api/admin/simulation-videos/${videoId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return resp.data
}

export async function adminDeleteSimulationVideo(videoId: number): Promise<void> {
  await api.delete(`/api/admin/simulation-videos/${videoId}`)
}
