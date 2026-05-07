import { api } from './client'

export type Role = 'user' | 'student' | 'teacher' | 'admin'

export type ApiUser = {
  id: number
  name: string
  email: string
  role: Role
  participant_code: string | null
}

export type AuthResponse = {
  token: string
  token_type: 'Bearer'
  expires_in: number
  user: ApiUser
}

export async function loginWithEmail(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  })
  return data
}

export async function registerWithEmail(payload: {
  name?: string
  email: string
  password: string
}) {
  const { data } = await api.post<AuthResponse>('/api/auth/register', payload)
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>('/api/auth/logout')
  return data
}

export async function getMe() {
  const { data } = await api.get<{ user: ApiUser }>('/api/me')
  return data
}

export async function getAdminMe() {
  const { data } = await api.get<{ user: ApiUser }>('/api/admin/me')
  return data
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ message: string }>('/api/auth/forgot-password', { email })
  return data
}
