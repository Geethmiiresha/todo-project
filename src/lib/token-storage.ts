const ACCESS_TOKEN_KEY = "taskboard.accessToken"
const REFRESH_TOKEN_KEY = "taskboard.refreshToken"

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

// Keep getToken alias for backwards compatibility
export const getToken = getAccessToken

export function saveAccessToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // storage unavailable
  }
}

export const saveToken = saveAccessToken

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch {
    // storage unavailable
  }
}

export function saveTokens(accessToken: string, refreshToken?: string): void {
  saveAccessToken(accessToken)
  if (refreshToken) {
    saveRefreshToken(refreshToken)
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // nothing to clear
  }
}

export const clearToken = clearTokens
