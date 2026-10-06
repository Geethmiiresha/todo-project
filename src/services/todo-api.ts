import { apiClient } from "@/services/api-client"
import type {
  CreateTodoRequest,
  PaginatedTodosResponse,
  Todo,
  TodoQueryParams,
  TodoSummary,
  UpdateTodoRequest,
} from "@/types/todo"

export const todoApi = {
  list: (params?: TodoQueryParams) => {
    const query = new URLSearchParams()
    if (params?.page !== undefined) query.set("page", String(params.page))
    if (params?.limit !== undefined) query.set("limit", String(params.limit))
    if (params?.search && params.search.trim()) query.set("search", params.search.trim())
    if (params?.status && params.status !== "all") query.set("status", params.status)
    if (params?.priority) query.set("priority", params.priority)
    if (params?.sortBy) query.set("sortBy", params.sortBy)
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder)

    const qs = query.toString()
    return apiClient.get<PaginatedTodosResponse>(qs ? `/todos?${qs}` : "/todos")
  },

  summary: () => apiClient.get<TodoSummary>("/todos/summary"),

  get: (id: string) => apiClient.get<Todo>(`/todos/${id}`),

  create: (input: CreateTodoRequest) => apiClient.post<Todo>("/todos", input),

  update: (id: string, changes: UpdateTodoRequest) =>
    apiClient.patch<Todo>(`/todos/${id}`, changes),

  remove: (id: string) => apiClient.delete<void>(`/todos/${id}`),

  clearCompleted: () => apiClient.delete<void>("/todos/completed"),
}
