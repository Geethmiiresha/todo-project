import { useId, useState } from "react"
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Flag,
  Folder,
  Pencil,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDateForInput, formatDueDate, isDueToday, isOverdue } from "@/lib/date"
import { cn } from "@/lib/utils"
import { validateTitle } from "@/lib/validation"
import type { Category } from "@/types/category"
import type { Tag } from "@/types/tag"
import type { Todo, TodoDraft, TodoPriority } from "@/types/todo"

interface TodoItemProps {
  todo: Todo
  categories?: Category[]
  tags?: Tag[]
  /** A request for this todo is in progress */
  isBusy: boolean
  onToggle: (id: string) => void
  /** Resolves to true when saved (edit mode then closes) */
  onUpdate: (id: string, draft: TodoDraft) => Promise<boolean>
  onDelete: (id: string) => void
}

const PRIORITIES: { value: TodoPriority; label: string; activeClass: string }[] = [
  { value: "LOW", label: "Low", activeClass: "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold" },
  { value: "MEDIUM", label: "Medium", activeClass: "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold" },
  { value: "HIGH", label: "High", activeClass: "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold" },
]

export function TodoItem({
  todo,
  categories = [],
  tags = [],
  isBusy,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [title, setTitle] = useState<string>(todo.title)
  const [description, setDescription] = useState<string>(todo.description)
  const [priority, setPriority] = useState<TodoPriority>(todo.priority ?? "MEDIUM")
  const [dueDate, setDueDate] = useState<string>(formatDateForInput(todo.dueDate))
  const [categoryId, setCategoryId] = useState<string>(todo.categoryId ?? "")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    todo.tags?.map((t) => t.id) ?? [],
  )
  const [error, setError] = useState<string | null>(null)

  const checkboxId = useId()
  const errorId = useId()
  const editDueDateId = useId()
  const editCatId = useId()

  const startEditing = () => {
    setTitle(todo.title)
    setDescription(todo.description)
    setPriority(todo.priority ?? "MEDIUM")
    setDueDate(formatDateForInput(todo.dueDate))
    setCategoryId(todo.categoryId ?? "")
    setSelectedTagIds(todo.tags?.map((t) => t.id) ?? [])
    setError(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setError(null)
  }

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateTitle(title)
    if (validationError) {
      setError(validationError)
      return
    }

    const saved = await onUpdate(todo.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
    })

    if (saved) setIsEditing(false)
  }

  const overdue = !todo.completed && isOverdue(todo.dueDate)
  const dueToday = !todo.completed && isDueToday(todo.dueDate)

  const rail = cn(
    "border-l-4 transition-colors",
    todo.completed
      ? "border-l-input"
      : overdue
        ? "border-l-destructive shadow-xs"
        : "border-l-primary",
  )

  if (isEditing) {
    return (
      <Card className={cn(rail, "p-4")}>
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Input
              value={title}
              autoFocus
              disabled={isBusy}
              aria-label="Task title"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
            />
            {error && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <Textarea
            value={description}
            disabled={isBusy}
            aria-label="Task description"
            placeholder="Add a description (optional)"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Edit Category & Tags */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={editCatId} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Folder className="size-3" /> Category
              </Label>
              <select
                id={editCatId}
                value={categoryId}
                disabled={isBusy}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-7 rounded-md border border-input bg-card px-2 text-xs text-foreground"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={editDueDateId} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" /> Due Date
                </Label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate("")}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear date
                  </button>
                )}
              </div>
              <Input
                id={editDueDateId}
                type="date"
                value={dueDate}
                disabled={isBusy}
                className="h-7 text-xs"
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Edit Tags */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <TagIcon className="size-3" /> Tags
              </Label>
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      #{t.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Edit Priority */}
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flag className="size-3" /> Priority
            </Label>
            <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-1">
              {PRIORITIES.map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={priority === value}
                  disabled={isBusy}
                  onClick={() => setPriority(value)}
                  className={cn(
                    "inline-flex h-7 items-center justify-center rounded-md border text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed",
                    priority === value
                      ? activeClass
                      : "border-border bg-card hover:bg-muted text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={cancelEditing}
            >
              <X /> Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isBusy}>
              <Check /> {isBusy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  const priorityVariant =
    todo.priority === "HIGH" ? "high" : todo.priority === "LOW" ? "low" : "medium"

  return (
    <Card
      className={cn(
        rail,
        "flex-row items-start gap-3 p-4 transition-shadow hover:shadow-xs",
        isBusy && "opacity-60",
        overdue && "bg-destructive/3",
      )}
      aria-busy={isBusy}
    >
      <Checkbox
        id={checkboxId}
        checked={todo.completed}
        disabled={isBusy}
        onCheckedChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        className="mt-1"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <label
            htmlFor={checkboxId}
            className={cn(
              "cursor-pointer text-base leading-snug font-medium break-words mr-1",
              todo.completed && "text-muted-foreground line-through",
            )}
          >
            {todo.title}
          </label>

          {/* Category Badge */}
          {todo.category && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                todo.completed && "opacity-60",
              )}
              style={{
                borderColor: `${todo.category.color}40`,
                backgroundColor: `${todo.category.color}15`,
                color: todo.category.color,
              }}
            >
              <Folder className="size-3" />
              {todo.category.name}
            </span>
          )}

          {/* Priority Badge */}
          {todo.priority && (
            <Badge variant={priorityVariant} className={cn(todo.completed && "opacity-60")}>
              <Flag className="size-3" />
              {todo.priority}
            </Badge>
          )}

          {/* Due Date & Overdue Badge */}
          {todo.dueDate && (
            <>
              {overdue ? (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="size-3" />
                  Overdue: {formatDueDate(todo.dueDate)}
                </Badge>
              ) : dueToday ? (
                <Badge variant="medium">
                  <Clock className="size-3" />
                  Due today
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-muted-foreground",
                    todo.completed && "line-through opacity-60",
                  )}
                >
                  <Calendar className="size-3" />
                  Due {formatDueDate(todo.dueDate)}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Tags list */}
        {todo.tags && todo.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {todo.tags.map((t) => (
              <span
                key={t.id}
                className={cn(
                  "inline-flex items-center rounded-sm bg-muted px-1.5 py-0.2 text-[11px] font-medium text-muted-foreground",
                  todo.completed && "line-through opacity-60",
                )}
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}

        {todo.description && (
          <p
            className={cn(
              "mt-1.5 text-sm break-words whitespace-pre-wrap text-muted-foreground",
              todo.completed && "line-through opacity-70",
            )}
          >
            {todo.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={isBusy}
          aria-label={`Edit ${todo.title}`}
          onClick={startEditing}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isBusy}
          aria-label={`Delete ${todo.title}`}
          className="text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 />
        </Button>
      </div>
    </Card>
  )
}
