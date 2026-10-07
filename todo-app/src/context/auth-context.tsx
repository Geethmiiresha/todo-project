import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { clearTokens, getAccessToken, saveTokens } from "@/lib/token-storage"
import { setUnauthorizedHandler } from "@/services/api-client"
import { authApi } from "@/services/auth-api"
import type { ChangePasswordInput, LoginInput, RegisterInput, User } from "@/types/auth"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  sessionExpired: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  changePassword: (input: ChangePasswordInput) => Promise<{ message: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // If an access token is saved, we are loading until we know who the user is
  const [isLoading, setIsLoading] = useState<boolean>(() => getAccessToken() !== null)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)

  // Token expired / invalid: log out and send the user to the login page
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearTokens()
      setUser(null)
      setSessionExpired(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // After a page refresh, restore the user from the saved token
  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    authApi
      .me()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser)
      })
      .catch(() => {
        // on 401 the unauthorized handler has already logged out
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (input: LoginInput): Promise<void> => {
    const result = await authApi.login(input)
    saveTokens(result.accessToken, result.refreshToken)
    setSessionExpired(false)
    setUser(result.user)
  }, [])

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
    const result = await authApi.register(input)
    saveTokens(result.accessToken, result.refreshToken)
    setSessionExpired(false)
    setUser(result.user)
  }, [])

  const logout = useCallback((): void => {
    authApi.logout().catch(() => {})
    clearTokens()
    setSessionExpired(false)
    setUser(null)
  }, [])

  const changePassword = useCallback(
    async (input: ChangePasswordInput): Promise<{ message: string }> => {
      return authApi.changePassword(input)
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, sessionExpired, login, register, logout, changePassword }),
    [user, isLoading, sessionExpired, login, register, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
  return context
}
