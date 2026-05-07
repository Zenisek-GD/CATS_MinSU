import axios from 'axios'

/** Collect ALL Laravel validation messages into a single string */
function pickLaravelValidationMessages(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const maybe = data as { errors?: unknown }
  const errors = maybe.errors
  if (!errors || typeof errors !== 'object') return null

  const messages: string[] = []
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === 'string') messages.push(v)
      }
    }
  }

  return messages.length > 0 ? messages.join(' ') : null
}

/** Generic API error message — used across all pages */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as unknown

    if (data && typeof data === 'object') {
      const msg = (data as { message?: unknown }).message
      if (typeof msg === 'string' && msg.trim()) return msg

      const validation = pickLaravelValidationMessages(data)
      if (validation) return validation
    }

    return err.message || fallback
  }

  if (err instanceof Error) return err.message
  return fallback
}

/**
 * Auth-specific error message mapper.
 * Converts HTTP status codes and Laravel validation errors into
 * clear, human-readable messages for login / register flows.
 */
export function getAuthErrorMessage(err: unknown, mode: 'login' | 'register' | 'forgot'): string {
  if (!axios.isAxiosError(err)) {
    if (err instanceof Error) return err.message
    return 'Something went wrong. Please try again.'
  }

  const status = err.response?.status
  const data = err.response?.data as Record<string, unknown> | undefined

  // --- Laravel validation errors (422) ---
  if (status === 422) {
    // Prefer the aggregated field errors over the generic "message"
    const validation = pickLaravelValidationMessages(data)
    if (validation) return validation

    const msg = data?.message
    if (typeof msg === 'string' && msg.trim()) return msg

    return mode === 'register'
      ? 'Please check your details — name, a valid email, and a password of at least 8 characters are required.'
      : 'Please enter a valid email address and password.'
  }

  // --- Common HTTP status codes ---
  if (status === 401) {
    return mode === 'login'
      ? 'Incorrect email or password. Please try again.'
      : 'Your session has expired. Please sign in again.'
  }

  if (status === 403) {
    return 'Your account does not have permission to access this. Please contact support.'
  }

  if (status === 404) {
    return mode === 'login'
      ? 'No account found with that email address.'
      : 'The requested resource was not found.'
  }

  if (status === 409) {
    return 'An account with this email address already exists. Try signing in instead.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment before trying again.'
  }

  if (status && status >= 500) {
    return 'Our server encountered an error. Please try again in a moment.'
  }

  // --- Network / no response ---
  if (!err.response) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }

  // --- Fallback: use Laravel message if present ---
  const msg = data?.message
  if (typeof msg === 'string' && msg.trim()) return msg

  return 'Something went wrong. Please try again.'
}

