/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ApiUser, AuthResponse } from '../api/auth'
import { getMe, logout as apiLogout } from '../api/auth'
import { setAuthToken } from '../api/client'

type AuthState = {
  token: string | null
  user: ApiUser | null
  isReady: boolean
  setSession: (resp: AuthResponse) => void
  clearSession: () => Promise<void>
  refreshMe: () => Promise<void>
}

const TOKEN_KEY = 'cats_token'
const USER_KEY = 'cats_user'

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<ApiUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as ApiUser) : null
  })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    ;(async () => {
      try {
        if (token) {
          setAuthToken(token)
          const me = await getMe()
          setUser(me.user)
          localStorage.setItem(USER_KEY, JSON.stringify(me.user))
        }
      } catch {
        // Token expired or invalid — clear it
        setToken(null)
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setAuthToken(null)
      } finally {
        setIsReady(true)
      }
    })()
  }, [token])

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isReady,
      setSession: (resp) => {
        setToken(resp.token)
        setUser(resp.user)
        localStorage.setItem(TOKEN_KEY, resp.token)
        localStorage.setItem(USER_KEY, JSON.stringify(resp.user))
        setAuthToken(resp.token)
      },
      clearSession: async () => {
        try {
          if (token) await apiLogout()
        } catch {
          // ignore
        }
        setToken(null)
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setAuthToken(null)
      },
      refreshMe: async () => {
        if (!token) return
        const me = await getMe()
        setUser(me.user)
        localStorage.setItem(USER_KEY, JSON.stringify(me.user))
      },
    }),
    [token, user, isReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
