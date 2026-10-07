import {
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  LogOut,
  Moon,
  Search,
  SlidersHorizontal,
  Sun,
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
import { useTheme } from "@/context/theme-context"
import { useCategories } from "@/hooks/use-categories"
import { useTags } from "@/hooks/use-tags"
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
  const { theme, toggleTheme } = useTheme()
  const {
    categories,
    addCategory,
  } = useCategories()
  const { tags, addTag } = useTags()
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
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="surface-toolbar mb-6 flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          <span className="mr-1.5 text-muted-foreground/70">Signed in as</span>
          <span className="font-semibold text-foreground">{user?.name}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-xl bg-card/80"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl bg-card/80"
            onClick={logout}
            aria-label="Log out"
          >
            <LogOut />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start xl:grid-cols-[23rem_1fr]">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
          <section className="relative flex min-h-48 items-center gap-5 overflow-hidden rounded-[1.5rem] bg-[#101c30] p-5 text-white shadow-xl shadow-slate-900/10 dark:bg-[#070d18] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full bg-primary/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 left-20 size-52 rounded-full bg-accent/10 blur-3xl"
            />
            <ProgressRing done={done} total={total} />
            <div className="relative min-w-0">
              <p className="eyebrow text-accent">Your personal space</p>
              <h1 className="mt-1 font-display text-2xl leading-tight font-bold sm:text-3xl">
                Taskboard
              </h1>
              <p className="mt-2 text-sm leading-5 text-white/70" aria-live="polite">
                {summaryText(status, total, remaining)}
              </p>
            </div>
          </section>

          <TodoForm
            categories={categories}
            tags={tags}
            onAddCategory={async (name, color) =>
              addCategory({ name, color })
            }
            onAddTag={async (name, color) => addTag({ name, color })}
            onAdd={addTodo}
            isSubmitting={isAdding}
          />
        </aside>

        <main className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                Your tasks
              </h2>
            </div>
            <span className="mb-0.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {total} {total === 1 ? "task" : "tasks"}
            </span>
          </div>
          {/* Search Bar */}
          <div className="relative rounded-2xl shadow-sm shadow-slate-900/[0.03]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Todos... (by title or description)"
              className="h-11 rounded-2xl border-input bg-card/90 pl-10 pr-9 shadow-sm transition-shadow focus-visible:shadow-md"
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
              className="flex gap-1 rounded-xl border border-border/50 bg-muted/70 p-1"
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
          <div className="surface-toolbar flex flex-wrap items-center justify-between gap-2.5 p-2.5 text-xs">
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
                categories={categories}
                tags={tags}
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
