import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

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
