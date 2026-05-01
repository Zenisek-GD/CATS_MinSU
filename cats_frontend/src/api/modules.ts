import { api } from './client'

export type ApiModuleTopic = {
  id: number
  training_module_id: number
  title: string
  content: string
  sort_order: number
}

export type ApiModuleProgress = {
  id: number
  last_topic_id: number | null
  is_completed: boolean
}

export type ApiTrainingModule = {
  id: number
  title: string
  description: string | null
  is_active: boolean
  quiz_id: number | null
  created_at?: string
  topics?: ApiModuleTopic[]
  quiz?: { id: number; title: string }
  user_progress?: ApiModuleProgress | null
}

export async function getModules(): Promise<{ modules: ApiTrainingModule[] }> {
  const resp = await api.get('/api/modules')
  return resp.data as { modules: ApiTrainingModule[] }
}

export async function getModule(id: string | number): Promise<{ module: ApiTrainingModule }> {
  const resp = await api.get(`/api/modules/${id}`)
  return resp.data as { module: ApiTrainingModule }
}

export async function updateModuleProgress(id: string | number, data: { last_topic_id?: number | null; is_completed?: boolean }): Promise<{ progress: ApiModuleProgress }> {
  const resp = await api.post(`/api/modules/${id}/progress`, data)
  return resp.data as { progress: ApiModuleProgress }
}
