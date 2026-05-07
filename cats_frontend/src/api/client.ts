import axios from 'axios'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').toString()
const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
const apiBaseUrl = trimmedBaseUrl.endsWith('/api') ? trimmedBaseUrl.slice(0, -4) : trimmedBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    // Bypass the ngrok browser warning page for API requests
    'ngrok-skip-browser-warning': 'true',
  },
})

// Dynamically attach the token on every request to prevent race conditions on page load
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cats_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization
    return
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}
