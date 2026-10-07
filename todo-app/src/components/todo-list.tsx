import { EmptyState } from "@/components/empty-state"
import { TodoItem } from "@/components/todo-item"
import type { Category } from "@/types/category"
import type { Tag } from "@/types/tag"
import type { Todo, TodoDraft, TodoFilter } from "@/types/todo"

interface TodoListProps {
  todos: Todo[]
  categories?: Category[]
  tags?: Tag[]
  filter: TodoFilter
  search?: string
  hasAnyTodos: boolean
  busyIds: ReadonlySet<string>
  onToggle: (id: string) => void
  onUpdate: (id: string, draft: TodoDraft) => Promise<boolean>
  onDelete: (id: string) => void
}

function emptyMessage(filter: TodoFilter, hasAnyTodos: boolean, search?: string): string {
  if (search && search.trim()) return `No tasks found matching "${search}".`
  if (!hasAnyTodos) return "No tasks yet. Add your first task using the form."
  if (filter === "active") return "Nothing left to do. Nice work."
  if (filter === "completed") return "No completed tasks yet."
  return "No tasks to show."
}

export function TodoList({
  todos,
  categories = [],
  tags = [],
  filter,
  search,
  hasAnyTodos,
  busyIds,
  onToggle,
  onUpdate,
  onDelete,
}: TodoListProps) {
  if (todos.length === 0) {
    return <EmptyState message={emptyMessage(filter, hasAnyTodos, search)} />
  }

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            categories={categories}
            tags={tags}
            isBusy={busyIds.has(todo.id)}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}
