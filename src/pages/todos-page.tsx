import {
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  LogOut,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react"

import { ErrorAlert } from "@/components/error-alert"
import { PaginationControls } from "@/components/pagination-controls"
import { ProgressRing } from "@/components/progress-ring"
import { TodoForm } from "@/components/todo-form"
import { TodoList } from "@/components/todo-list"
import { TodoListSkeleton } from "@/components/todo-list-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useTodos } from "@/hooks/use-todos"
import type { LoadStatus } from "@/hooks/use-todos"
import type { TodoFilter, TodoPriority, TodoSortBy } from "@/types/todo"

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
]

const SORT_OPTIONS: { value: TodoSortBy; label: string }[] = [
  { value: "createdAt", label: "Created date" },
  { value: "updatedAt", label: "Updated date" },
  { value: "title", label: "Title" },
  { value: "completed", label: "Completion status" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
]

const PRIORITY_OPTIONS: { value: TodoPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Priorities" },
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
]

function summaryText(status: LoadStatus, total: number, remaining: number): string {
  if (status === "loading") return "Loading your tasks…"
  if (status === "error") return "Your tasks could not be loaded."
  if (total === 0) return "Add a task to get started."
  if (remaining === 0) return "Everything is done."
  return `${remaining} ${remaining === 1 ? "task" : "tasks"} left to do.`
}

export default function TodosPage() {
  const { user, logout } = useAuth()
  const {
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
    sortBy,
    sortOrder,
    setSearch,
    setFilter,
    setPriorityFilter,
    setSortBy,
    toggleSortOrder,
    setPage,
    setLimit,
    resetFilters,

    reload,
    dismissActionError,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
  } = useTodos()

  const total = summary.total
  const done = summary.completed
  const remaining = summary.active
  const isReady = status === "ready"

  const hasActiveFilters = Boolean(
    search.trim() || filter !== "all" || priorityFilter !== "ALL",
  )

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.name}</span>
        </p>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut /> Log out
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
          <section className="flex items-center gap-5 rounded-lg bg-foreground p-6 text-background">
            <ProgressRing done={done} total={total} />
            <div className="min-w-0">
              <h1 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
                Taskboard
              </h1>
              <p className="mt-2 text-sm text-white/70" aria-live="polite">
                {summaryText(status, total, remaining)}
              </p>
            </div>
          </section>

          <TodoForm onAdd={addTodo} isSubmitting={isAdding} />
        </aside>

        <main className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Todos... (by title or description)"
              className="pl-9 pr-9"
              aria-label="Search Todos"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filtering and Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div
              role="group"
              aria-label="Filter tasks"
              className="flex gap-1 rounded-lg bg-muted p-1"
            >
              {FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "default" : "ghost"}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Clear Completed Action */}
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady || done === 0 || isClearing}
              onClick={() => void clearCompleted()}
            >
              <Trash2 /> {isClearing ? "Clearing…" : "Clear completed"}
            </Button>
          </div>

          {/* Sorting and Secondary Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border/60 bg-card/60 p-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort By Dropdown */}
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <SlidersHorizontal className="size-3.5" />
                <span className="font-medium text-foreground">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as TodoSortBy)}
                  className="rounded border border-input bg-card px-2 py-1 text-xs text-foreground cursor-pointer"
                  aria-label="Sort todos by"
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Sort Order Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={toggleSortOrder}
                title={sortOrder === "ASC" ? "Ascending order" : "Descending order"}
                aria-label={`Sort ${sortOrder === "ASC" ? "ascending" : "descending"}`}
              >
                {sortOrder === "ASC" ? (
                  <>
                    <ArrowUpAZ className="size-3.5" /> Asc
                  </>
                ) : (
                  <>
                    <ArrowDownAZ className="size-3.5" /> Desc
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Filter */}
              <label className="flex items-center gap-1.5 text-muted-foreground">
                <Filter className="size-3.5" />
                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value as TodoPriority | "ALL")
                  }
                  className="rounded border border-input bg-card px-2 py-1 text-xs text-foreground cursor-pointer"
                  aria-label="Filter by priority"
                >
                  {PRIORITY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              )}
            </div>
          </div>

          {actionError && <ErrorAlert message={actionError} onDismiss={dismissActionError} />}

          {status === "loading" && <TodoListSkeleton />}

          {status === "error" && (
            <ErrorAlert
              message={loadError ?? "Could not load your tasks."}
              onRetry={() => void reload()}
            />
          )}

          {isReady && (
            <>
              <TodoList
                todos={todos}
                filter={filter}
                search={search}
                hasAnyTodos={total > 0}
                busyIds={busyIds}
                onToggle={(id) => void toggleTodo(id)}
                onUpdate={updateTodo}
                onDelete={(id) => void deleteTodo(id)}
              />

              <PaginationControls
                meta={meta}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
