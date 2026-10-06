import { useId, useState } from "react"
import { Calendar, Flag, Folder, Plus, Tag as TagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TITLE_MAX_LENGTH, validateTitle } from "@/lib/validation"
import type { Category } from "@/types/category"
import type { Tag } from "@/types/tag"
import type { TodoDraft, TodoPriority } from "@/types/todo"

interface TodoFormProps {
  categories: Category[]
  tags: Tag[]
  onAddCategory: (name: string, color?: string) => Promise<Category | null>
  onAddTag: (name: string, color?: string) => Promise<Tag | null>
  /** Resolves to true when the todo was saved (the form is then cleared) */
  onAdd: (draft: TodoDraft) => Promise<boolean>
  isSubmitting: boolean
}

const PRIORITIES: { value: TodoPriority; label: string; activeClass: string }[] = [
  { value: "LOW", label: "Low", activeClass: "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold" },
  { value: "MEDIUM", label: "Medium", activeClass: "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold" },
  { value: "HIGH", label: "High", activeClass: "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold" },
]

export function TodoForm({
  categories,
  tags,
  onAddCategory,
  onAddTag,
  onAdd: onAddProp,
  isSubmitting,
}: TodoFormProps) {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [dueDate, setDueDate] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Quick-create state
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false)
  const [newCatName, setNewCatName] = useState<string>("")
  const [showNewTagInput, setShowNewTagInput] = useState<boolean>(false)
  const [newTagName, setNewTagName] = useState<string>("")

  const titleId = useId()
  const descriptionId = useId()
  const dueDateId = useId()
  const categorySelectId = useId()
  const errorId = useId()

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    const created = await onAddCategory(newCatName.trim())
    if (created) {
      setCategoryId(created.id)
      setNewCatName("")
      setShowNewCatInput(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const created = await onAddTag(newTagName.trim())
    if (created) {
      setSelectedTagIds((prev) => [...prev, created.id])
      setNewTagName("")
      setShowNewTagInput(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateTitle(title)
    if (validationError) {
      setError(validationError)
      return
    }

    const saved = await onAddProp({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
    })

    if (saved) {
      setTitle("")
      setDescription("")
      setPriority("MEDIUM")
      setDueDate("")
      setCategoryId("")
      setSelectedTagIds([])
      setError(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Give it a title. Add details, category, and tags.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={titleId}>Title</Label>
            <Input
              id={titleId}
              value={title}
              disabled={isSubmitting}
              maxLength={TITLE_MAX_LENGTH + 20}
              placeholder="e.g. Finish the React assignment"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor={descriptionId}>
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={descriptionId}
              value={description}
              disabled={isSubmitting}
              placeholder="Notes, links, or steps"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={categorySelectId} className="flex items-center gap-1.5">
                <Folder className="size-3.5 text-muted-foreground" /> Category
              </Label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {showNewCatInput ? "Cancel" : "+ New category"}
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex gap-2">
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Work, Study)"
                  className="h-8 text-xs"
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={handleCreateCategory}
                >
                  Create
                </Button>
              </div>
            ) : (
              <select
                id={categorySelectId}
                value={categoryId}
                disabled={isSubmitting}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tags Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <TagIcon className="size-3.5 text-muted-foreground" /> Tags
              </Label>
              <button
                type="button"
                onClick={() => setShowNewTagInput(!showNewTagInput)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {showNewTagInput ? "Cancel" : "+ New tag"}
              </button>
            </div>

            {showNewTagInput && (
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name (e.g. backend, urgent)"
                  className="h-8 text-xs"
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={handleCreateTag}
                >
                  Add
                </Button>
              </div>
            )}

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
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
            ) : (
              <p className="text-xs text-muted-foreground">No tags yet. Add one above.</p>
            )}
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5">
                <Flag className="size-3.5 text-muted-foreground" /> Priority
              </Label>
              <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-1">
                {PRIORITIES.map(({ value, label, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={priority === value}
                    disabled={isSubmitting}
                    onClick={() => setPriority(value)}
                    className={cn(
                      "inline-flex h-8 items-center justify-center rounded-md border text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed",
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

            <div className="flex flex-col gap-2">
              <Label htmlFor={dueDateId} className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" /> Due Date{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id={dueDateId}
                type="date"
                value={dueDate}
                disabled={isSubmitting}
                className="h-8 text-xs"
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
            <Plus /> {isSubmitting ? "Adding…" : "Add task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
