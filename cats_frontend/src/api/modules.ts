import { api } from './client'

export type ApiTrainingModule = {
  id: number
  title: string
  description: string | null
  is_active: boolean
  created_at?: string
}

export async function getModules(): Promise<{ modules: ApiTrainingModule[] }> {
  const resp = await api.get('/api/modules')
  return resp.data as { modules: ApiTrainingModule[] }
}
