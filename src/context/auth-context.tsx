import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { clearToken, getToken, saveToken } from "@/lib/token-storage"
import { setUnauthorizedHandler } from "@/services/api-client"
import { authApi } from "@/services/auth-api"
import type { LoginInput, RegisterInput, User } from "@/types/auth"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  sessionExpired: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // If a token is saved, we are loading until we know who the user is
  const [isLoading, setIsLoading] = useState<boolean>(() => getToken() !== null)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)

  // Token expired / invalid: log out and send the user to the login page
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken()
      setUser(null)
      setSessionExpired(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // After a page refresh, restore the user from the saved token
  useEffect(() => {
    if (!getToken()) return

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
    saveToken(result.accessToken)
    setSessionExpired(false)
    setUser(result.user)
  }, [])

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
    const result = await authApi.register(input)
    saveToken(result.accessToken)
    setSessionExpired(false)
    setUser(result.user)
  }, [])

  const logout = useCallback((): void => {
    clearToken()
    setSessionExpired(false)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, sessionExpired, login, register, logout }),
    [user, isLoading, sessionExpired, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
  return context
}
