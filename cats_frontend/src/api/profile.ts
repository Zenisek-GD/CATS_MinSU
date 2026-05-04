import { api } from './client'

export type UserAchievement = {
  id: number
  name: string
  description: string | null
  icon: string
  xp_reward: number
  unlocked_at: string
}

export type UserBadge = {
  id: number
  name: string
  description: string | null
  icon: string
  awarded_at: string
}

export type ModuleProgressItem = {
  module_id: number
  module_name: string
  is_completed: boolean
  last_topic_id: number | null
}

export type ProfileStats = {
  total_modules: number
  completed_modules: number
  completion_percentage: number
  total_achievements: number
  total_badges: number
  total_xp: number
}

export type ProfileData = {
  user: {
    id: number
    name: string
    email: string
    role: string
    xp: number
    participant_code: string | null
  }
  stats: ProfileStats
  achievements: UserAchievement[]
  badges: UserBadge[]
  module_progress: ModuleProgressItem[]
}

export async function getProfileStats(): Promise<ProfileData> {
  const resp = await api.get('/api/profile')
  return resp.data as ProfileData
}
