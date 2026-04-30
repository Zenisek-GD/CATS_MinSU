import { api } from './client'

export type UserDashboard = {
  welcome: string
  training_progress: {
    completed_modules: number
    total_modules: number
    percent: number
  }
  quiz_scores: Array<{ label: string; score: number }>
  simulation_completion_percent: number
  cyber_awareness_level: string
  badges: Array<{ title: string }>
  certificates: Array<{ title: string }>
  recent_activities: Array<{ text: string; at: string }>
  notifications: Array<{ text: string; at?: string }>
}

export type AdminDashboard = {
  totals: {
    total_users: number
    active_participants: number
    average_quiz_score: number | null
  }
  most_failed_cyber_threats: Array<{ title: string; count: number }>
  user_analytics: {
    roles: {
      admin: number
      user: number
    }
  }
  system_reports: Array<{ title: string; value: string; at: string }>
  training_modules: {
    total: number
    active: number
  }
}

export type AdminUserList = {
  users: Array<{
    id: number
    name: string
    email: string
    role: 'user' | 'admin'
    participant_code: string | null
    created_at: string
  }>
}

export type AdminModuleList = {
  modules: Array<{
    id: number
    title: string
    description: string | null
    is_active: boolean
    created_at: string
  }>
}

export async function getUserDashboard() {
  const { data } = await api.get<UserDashboard>('/api/dashboard')
  return data
}

export async function getAdminDashboard() {
  const { data } = await api.get<AdminDashboard>('/api/admin/dashboard')
  return data
}

export async function getAdminUsers() {
  const { data } = await api.get<AdminUserList>('/api/admin/users')
  return data
}

export async function getAdminModules() {
  const { data } = await api.get<AdminModuleList>('/api/admin/modules')
  return data
}
