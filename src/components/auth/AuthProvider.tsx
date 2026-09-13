'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type AuthUser = {
  id: number
  email: string
  emailVerified: string | null
  name: string
  site: string | null
  pendingSite: string | null
  discordId: string | null
  discordDisplayName: string | null
  steamId: string | null
  steamDisplayName: string | null
  googleId: string | null
  googleDisplayName: string | null
  githubId: string | null
  githubLogin: string | null
  githubDisplayName: string | null
  telegramId: string | null
  telegramUsername: string | null
  telegramDisplayName: string | null
  status: number
  balance: number
  payable: number
  role: string
  roles: string[]
  language: string
  resourcesCount: number
  coOwnerResourcesCount: number
  verifiedSites: unknown[]
  personalSites: unknown[]
  legalAcceptedAt: string | null
  tourDoneAt: string | null
  resourceTourDoneAt: string | null
  hasPinSet: boolean
  notificationSoundEnabled: boolean
  purchaseSoundEnabled: boolean
  messagesSoundEnabled: boolean
  purchaseNotificationsEnabled: boolean
  saleNotificationsEnabled: boolean
  messageNotificationsEnabled: boolean
  purchaseNotificationsChannel: string
  purchaseNotificationsChannels: string[]
  messageNotificationsChannel: string
  messageNotificationsChannels: string[]
  image: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) {
        if (mountedRef.current) setUser(null)
        return
      }
      const data = (await res.json().catch(() => null)) as { user?: AuthUser | null } | null
      if (mountedRef.current) setUser(data && data.user ? data.user : null)
    } catch {
      if (mountedRef.current) setUser(null)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
    }
    await refresh()
  }, [refresh])

  useEffect(() => {
    mountedRef.current = true
    void refresh()
    return () => {
      mountedRef.current = false
    }
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
