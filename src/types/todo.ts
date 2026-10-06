export type TodoPriority = "LOW" | "MEDIUM" | "HIGH"

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TodoPriority
  dueDate: string | null
  createdAt?: string
  updatedAt?: string
}

/** The user-editable fields of a todo. */
export interface TodoDraft {
  title: string
  description?: string
  priority?: TodoPriority
  dueDate?: string | null
}

export type TodoFilter = "all" | "active" | "completed"

export type TodoSortBy =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "completed"
  | "dueDate"
  | "priority"

export type SortOrder = "ASC" | "DESC"

export interface TodoQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: TodoFilter
  priority?: TodoPriority
  sortBy?: TodoSortBy
  sortOrder?: SortOrder
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedTodosResponse {
  data: Todo[]
  meta: PaginationMeta
}

export interface TodoSummary {
  total: number
  completed: number
  active: number
}

/** Body of POST /todos */
export type CreateTodoRequest = TodoDraft & { completed?: boolean }

/** Body of PATCH /todos/:id */
export type UpdateTodoRequest = Partial<TodoDraft & Pick<Todo, "completed">>
