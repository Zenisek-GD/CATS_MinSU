import axios from 'axios'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').toString()
const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
const apiBaseUrl = trimmedBaseUrl.endsWith('/api') ? trimmedBaseUrl.slice(0, -4) : trimmedBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization
    return
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}
