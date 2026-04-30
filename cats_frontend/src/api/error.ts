import axios from 'axios'

function pickLaravelValidationMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const maybe = data as { errors?: unknown }
  const errors = maybe.errors
  if (!errors || typeof errors !== 'object') return null

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }

  return null
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as unknown

    if (data && typeof data === 'object') {
      const msg = (data as { message?: unknown }).message
      if (typeof msg === 'string' && msg.trim()) return msg

      const validation = pickLaravelValidationMessage(data)
      if (validation) return validation
    }

    return err.message || fallback
  }

  if (err instanceof Error) return err.message
  return fallback
}
