import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/token-storage"

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type UnauthorizedHandler = () => void
let unauthorizedHandler: UnauthorizedHandler | null = null

/** Called when a user cannot be authenticated even after refresh attempt */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (typeof body === "object" && body !== null && "message" in body) {
      const { message } = body as { message: unknown }
      if (Array.isArray(message)) return message.join(" ")
      if (typeof message === "string") return message
    }
  } catch {
    // response had no JSON body
  }
  return `Request failed (${response.status})`
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        clearTokens()
        unauthorizedHandler?.()
        return null
      }

      const data = (await response.json()) as { accessToken: string; refreshToken?: string }
      saveTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    } catch {
      clearTokens()
      unauthorizedHandler?.()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0)
  }

  if (response.status === 401 && retry && !path.startsWith("/auth/login") && !path.startsWith("/auth/refresh")) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      // Retry with new token
      return request<T>(path, init, false)
    }
    unauthorizedHandler?.()
    throw new ApiError("Session expired. Please sign in again.", 401)
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      unauthorizedHandler?.()
    }
    throw new ApiError(await parseErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function withBody(method: string, body?: unknown): RequestInit {
  return { method, body: body === undefined ? undefined : JSON.stringify(body) }
}

/** The one place that knows how to talk to the NestJS API. */
export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, withBody("POST", body)),
  patch: <T>(path: string, body?: unknown) => request<T>(path, withBody("PATCH", body)),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
