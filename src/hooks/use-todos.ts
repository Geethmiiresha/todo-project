import { useCallback, useEffect, useRef, useState } from "react"

import { getErrorMessage } from "@/lib/errors"
import { todoApi } from "@/services/todo-api"
import type {
  PaginationMeta,
  SortOrder,
  Todo,
  TodoDraft,
  TodoFilter,
  TodoPriority,
  TodoSortBy,
  TodoSummary,
} from "@/types/todo"

export type LoadStatus = "loading" | "error" | "ready"

export interface UseTodosResult {
  todos: Todo[]
  meta: PaginationMeta
  summary: TodoSummary
  status: LoadStatus
  loadError: string | null
  actionError: string | null
  isAdding: boolean
  isClearing: boolean
  busyIds: ReadonlySet<string>

  // Query states
  search: string
  filter: TodoFilter
  priorityFilter: TodoPriority | "ALL"
  categoryId: string | null
  tagId: string | null
  sortBy: TodoSortBy
  sortOrder: SortOrder
  page: number
  limit: number

  // Query state setters
  setSearch: (search: string) => void
  setFilter: (filter: TodoFilter) => void
  setPriorityFilter: (priority: TodoPriority | "ALL") => void
  setCategoryId: (id: string | null) => void
  setTagId: (id: string | null) => void
  setSortBy: (sortBy: TodoSortBy) => void
  setSortOrder: (order: SortOrder) => void
  toggleSortOrder: () => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  resetFilters: () => void

  // Actions
  reload: () => Promise<void>
  dismissActionError: () => void
  addTodo: (draft: TodoDraft) => Promise<boolean>
  toggleTodo: (id: string) => Promise<boolean>
  updateTodo: (id: string, draft: TodoDraft) => Promise<boolean>
  deleteTodo: (id: string) => Promise<boolean>
  clearCompleted: () => Promise<boolean>
}

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const DEFAULT_SUMMARY: TodoSummary = {
  total: 0,
  completed: 0,
  active: 0,
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META)
  const [summary, setSummary] = useState<TodoSummary>(DEFAULT_SUMMARY)
  const [status, setStatus] = useState<LoadStatus>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isClearing, setIsClearing] = useState<boolean>(false)
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set())

  // Query controls
  const [search, setSearchState] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [filter, setFilterState] = useState<TodoFilter>("all")
  const [priorityFilter, setPriorityFilterState] = useState<TodoPriority | "ALL">("ALL")
  const [categoryId, setCategoryIdState] = useState<string | null>(null)
  const [tagId, setTagIdState] = useState<string | null>(null)
  const [sortBy, setSortByState] = useState<TodoSortBy>("createdAt")
  const [sortOrder, setSortOrderState] = useState<SortOrder>("DESC")
  const [page, setPageState] = useState<number>(1)
  const [limit, setLimitState] = useState<number>(10)

  const isMounted = useRef<boolean>(true)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPageState(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  const setSearch = useCallback((val: string) => {
    setSearchState(val)
  }, [])

  const setFilter = useCallback((val: TodoFilter) => {
    setFilterState(val)
    setPageState(1)
  }, [])

  const setPriorityFilter = useCallback((val: TodoPriority | "ALL") => {
    setPriorityFilterState(val)
    setPageState(1)
  }, [])

  const setCategoryId = useCallback((val: string | null) => {
    setCategoryIdState(val)
    setPageState(1)
  }, [])

  const setTagId = useCallback((val: string | null) => {
    setTagIdState(val)
    setPageState(1)
  }, [])

  const setSortBy = useCallback((val: TodoSortBy) => {
    setSortByState(val)
    setPageState(1)
  }, [])

  const setSortOrder = useCallback((val: SortOrder) => {
    setSortOrderState(val)
    setPageState(1)
  }, [])

  const toggleSortOrder = useCallback(() => {
    setSortOrderState((prev) => (prev === "ASC" ? "DESC" : "ASC"))
    setPageState(1)
  }, [])

  const setPage = useCallback((val: number) => {
    setPageState(val)
  }, [])

  const setLimit = useCallback((val: number) => {
    setLimitState(val)
    setPageState(1)
  }, [])

  const resetFilters = useCallback(() => {
    setSearchState("")
    setDebouncedSearch("")
    setFilterState("all")
    setPriorityFilterState("ALL")
    setCategoryIdState(null)
    setTagIdState(null)
    setSortByState("createdAt")
    setSortOrderState("DESC")
    setPageState(1)
  }, [])

  const load = useCallback(async (): Promise<void> => {
    setStatus("loading")
    setLoadError(null)
    try {
      const [listResult, summaryResult] = await Promise.all([
        todoApi.list({
          page,
          limit,
          search: debouncedSearch.trim() || undefined,
          status: filter,
          priority: priorityFilter === "ALL" ? undefined : priorityFilter,
          categoryId: categoryId || undefined,
          tagId: tagId || undefined,
          sortBy,
          sortOrder,
        }),
        todoApi.summary().catch(() => DEFAULT_SUMMARY),
      ])

      if (!isMounted.current) return
      setTodos(listResult.data)
      setMeta(listResult.meta)
      setSummary(summaryResult)
      setStatus("ready")
    } catch (error) {
      if (!isMounted.current) return
      setLoadError(getErrorMessage(error, "Could not load your tasks."))
      setStatus("error")
    }
  }, [page, limit, debouncedSearch, filter, priorityFilter, categoryId, tagId, sortBy, sortOrder])

  useEffect(() => {
    void load()
  }, [load])

  const runForTodo = async (
    id: string,
    fallbackError: string,
    action: () => Promise<void>,
  ): Promise<boolean> => {
    setActionError(null)
    setBusyIds((prev) => new Set(prev).add(id))
    try {
      await action()
      return true
    } catch (error) {
      setActionError(getErrorMessage(error, fallbackError))
      return false
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const refreshSummary = async () => {
    try {
      const updatedSummary = await todoApi.summary()
      if (isMounted.current) setSummary(updatedSummary)
    } catch {
      // ignore
    }
  }

  const addTodo = async (draft: TodoDraft): Promise<boolean> => {
    setActionError(null)
    setIsAdding(true)
    try {
      await todoApi.create(draft)
      await load()
      return true
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not add the task. Try again."))
      return false
    } finally {
      setIsAdding(false)
    }
  }

  const toggleTodo = async (id: string): Promise<boolean> => {
    const current = todos.find((todo) => todo.id === id)
    if (!current) return false

    return runForTodo(id, "Could not update the task. Try again.", async () => {
      const updated = await todoApi.update(id, { completed: !current.completed })
      if (filter !== "all") {
        await load()
      } else {
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        void refreshSummary()
      }
    })
  }

  const updateTodo = async (id: string, draft: TodoDraft): Promise<boolean> =>
    runForTodo(id, "Could not save your changes. Try again.", async () => {
      const updated = await todoApi.update(id, draft)
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      if (
        sortBy === "title" ||
        sortBy === "priority" ||
        sortBy === "dueDate" ||
        categoryId ||
        tagId
      ) {
        await load()
      } else {
        void refreshSummary()
      }
    })

  const deleteTodo = async (id: string): Promise<boolean> =>
    runForTodo(id, "Could not delete the task. Try again.", async () => {
      await todoApi.remove(id)
      if (todos.length === 1 && page > 1) {
        setPageState((p) => p - 1)
      } else {
        await load()
      }
    })

  const clearCompleted = async (): Promise<boolean> => {
    setActionError(null)
    setIsClearing(true)
    try {
      await todoApi.clearCompleted()
      setPageState(1)
      await load()
      return true
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not clear completed tasks. Try again."))
      return false
    } finally {
      setIsClearing(false)
    }
  }

  return {
    todos,
    meta,
    summary,
    status,
    loadError,
    actionError,
    isAdding,
    isClearing,
    busyIds,

    search,
    filter,
    priorityFilter,
    categoryId,
    tagId,
    sortBy,
    sortOrder,
    page,
    limit,

    setSearch,
    setFilter,
    setPriorityFilter,
    setCategoryId,
    setTagId,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    setPage,
    setLimit,
    resetFilters,

    reload: load,
    dismissActionError: () => setActionError(null),
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
  }
}
