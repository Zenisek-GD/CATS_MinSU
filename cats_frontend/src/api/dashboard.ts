import { api } from './client'

/* ─── Enhanced Admin Dashboard ─── */

export type AdminDashboard = {
  totals: {
    total_users: number
    active_participants: number
    average_quiz_score: number | null
    quiz_completion_rate: number
    simulation_completion_rate: number
    certificates_issued: number
    most_failed_category: string | null
  }
  most_active_users: Array<{
    id: number; name: string; email: string
    activity_count: number; quiz_attempts: number; simulation_runs: number
  }>
  most_failed_cyber_threats: Array<{ title: string; count: number }>
  user_analytics: { roles: { admin: number; user: number } }
  charts: {
    user_growth: Array<{ month: string; count: number }>
    quiz_trends: Array<{ month: string; avg_score: number }>
    category_performance: Array<{ category: string; total: number; correct: number; percent: number }>
    daily_activity: Array<{ date: string; quiz_attempts: number; simulation_runs: number }>
    simulation_analytics: { completed: number; in_progress: number; expired: number }
  }
  system_reports: Array<{ title: string; value: string; at: string }>
  training_modules: { total: number; active: number }
}

export type UserDashboard = {
  welcome: string
  training_progress: { completed_modules: number; total_modules: number; percent: number }
  quiz_scores: Array<{ label: string; score: number }>
  simulation_completion_percent: number
  cyber_awareness_level: string
  badges: Array<{ title: string }>
  certificates: Array<{ title: string }>
  recent_activities: Array<{ text: string; at: string }>
  notifications: Array<{ text: string; at?: string }>
}

export type AdminUser = {
  id: number; name: string; email: string; role: 'user' | 'admin'
  status: string; xp: number; participant_code: string | null
  last_login_at: string | null; created_at: string
}

export type UserPerformance = {
  user: { id: number; name: string; email: string; role: string; status: string; xp: number }
  quiz_attempts: Array<{ id: number; quiz_id: number; score: number; max_score: number; updated_at: string; quiz?: { id: number; title: string } }>
  average_quiz_score: number
  simulation_runs: Array<{ id: number; simulation_id: number; status: string; score: number; max_score: number; started_at: string; simulation?: { id: number; title: string } }>
  badges: Array<{ badge: { id: number; name: string; icon: string }; awarded_at: string }>
  awareness_level: string
}

/* ─── API calls ─── */

export async function getUserDashboard() {
  const { data } = await api.get<UserDashboard>('/api/dashboard')
  return data
}

export async function getAdminDashboard() {
  const { data } = await api.get<AdminDashboard>('/api/admin/dashboard')
  return data
}

export async function getAdminUsers(params?: { search?: string; role?: string; status?: string }) {
  const { data } = await api.get<{ users: AdminUser[] }>('/api/admin/users', { params })
  return data
}

export async function adminCreateUser(payload: { name: string; email: string; password: string; role?: string }) {
  const { data } = await api.post<{ user: AdminUser }>('/api/admin/users', payload)
  return data
}

export async function adminUpdateUser(id: number, payload: Partial<{ name: string; email: string; password: string; role: string }>) {
  const { data } = await api.patch<{ user: AdminUser }>(`/api/admin/users/${id}`, payload)
  return data
}

export async function adminDeleteUser(id: number) {
  await api.delete(`/api/admin/users/${id}`)
}

export async function adminUpdateUserStatus(id: number, status: 'active' | 'suspended') {
  const { data } = await api.patch<{ user: AdminUser; message: string }>(`/api/admin/users/${id}/status`, { status })
  return data
}

export async function adminResetPassword(id: number) {
  const { data } = await api.post<{ message: string; temporary_password: string }>(`/api/admin/users/${id}/reset-password`)
  return data
}

export async function adminGetUserPerformance(id: number) {
  const { data } = await api.get<UserPerformance>(`/api/admin/users/${id}/performance`)
  return data
}

/* ─── Quiz Management ─── */

export type AdminQuiz = {
  id: number; category_id: number; title: string; description: string | null
  kind: string; difficulty: string; time_limit_seconds: number | null
  is_active: boolean; questions_count?: number
  category?: { id: number; slug: string; name: string } | null
}

export type AdminCategory = { id: number; slug: string; name: string }

export async function adminGetQuizzes() {
  const { data } = await api.get<{ quizzes: AdminQuiz[] }>('/api/admin/quizzes')
  return data
}

export async function adminCreateQuiz(payload: {
  category_id: number; title: string; description?: string; kind: string
  difficulty: string; time_limit_seconds?: number | null; is_active?: boolean
}) {
  const { data } = await api.post<{ quiz: AdminQuiz }>('/api/admin/quizzes', payload)
  return data
}

export async function adminUpdateQuiz(id: number, payload: Partial<AdminQuiz>) {
  const { data } = await api.patch<{ quiz: AdminQuiz }>(`/api/admin/quizzes/${id}`, payload)
  return data
}

export async function adminDeleteQuiz(id: number) {
  await api.delete(`/api/admin/quizzes/${id}`)
}

export async function adminGetCategories() {
  const { data } = await api.get<{ categories: AdminCategory[] }>('/api/admin/quiz-categories')
  return data
}

export async function adminCreateCategory(payload: { name: string; slug: string }) {
  const { data } = await api.post<{ category: AdminCategory }>('/api/admin/quiz-categories', payload)
  return data
}

export async function adminUpdateCategory(id: number, payload: Partial<{ name: string; slug: string }>) {
  const { data } = await api.patch<{ category: AdminCategory }>(`/api/admin/quiz-categories/${id}`, payload)
  return data
}

export async function adminDeleteCategory(id: number) {
  await api.delete(`/api/admin/quiz-categories/${id}`)
}

/* ─── Badge Management ─── */

export type AdminBadge = {
  id: number; name: string; slug: string; description: string | null
  icon: string; condition_type: string | null; condition_value: number | null
  user_badges_count?: number
}

export async function adminGetBadges() {
  const { data } = await api.get<{ badges: AdminBadge[] }>('/api/admin/badges')
  return data
}

export async function adminCreateBadge(payload: Partial<AdminBadge>) {
  const { data } = await api.post<{ badge: AdminBadge }>('/api/admin/badges', payload)
  return data
}

export async function adminUpdateBadge(id: number, payload: Partial<AdminBadge>) {
  const { data } = await api.patch<{ badge: AdminBadge }>(`/api/admin/badges/${id}`, payload)
  return data
}

export async function adminDeleteBadge(id: number) {
  await api.delete(`/api/admin/badges/${id}`)
}

/* ─── Achievement Management ─── */

export type AdminAchievement = {
  id: number; name: string; slug: string; description: string | null
  icon: string; xp_reward: number; condition_type: string | null; condition_value: number | null
  user_achievements_count?: number
}

export async function adminGetAchievements() {
  const { data } = await api.get<{ achievements: AdminAchievement[] }>('/api/admin/achievements')
  return data
}

export async function adminCreateAchievement(payload: Partial<AdminAchievement>) {
  const { data } = await api.post<{ achievement: AdminAchievement }>('/api/admin/achievements', payload)
  return data
}

export async function adminUpdateAchievement(id: number, payload: Partial<AdminAchievement>) {
  const { data } = await api.patch<{ achievement: AdminAchievement }>(`/api/admin/achievements/${id}`, payload)
  return data
}

export async function adminDeleteAchievement(id: number) {
  await api.delete(`/api/admin/achievements/${id}`)
}

/* ─── Legacy compatibility for HomePage.tsx ─── */

export type AdminUserList = { users: AdminUser[] }

export type AdminModuleList = {
  modules: Array<{
    id: number; title: string; description: string | null
    is_active: boolean; created_at: string
  }>
}

export async function getAdminModules() {
  const { data } = await api.get<AdminModuleList>('/api/admin/modules')
  return data
}
