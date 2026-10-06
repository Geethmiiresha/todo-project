import { getToken } from "@/lib/token-storage"

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

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

/** Called when a logged-in user's token is rejected (expired / invalid). */
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0)
  }

  if (!response.ok) {
    // A token was sent but rejected: the session has expired
    if (response.status === 401 && token) unauthorizedHandler?.()
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
