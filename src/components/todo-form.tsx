import { useId, useState } from "react"
import { Calendar, Flag, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TITLE_MAX_LENGTH, validateTitle } from "@/lib/validation"
import type { TodoDraft, TodoPriority } from "@/types/todo"

interface TodoFormProps {
  /** Resolves to true when the todo was saved (the form is then cleared) */
  onAdd: (draft: TodoDraft) => Promise<boolean>
  isSubmitting: boolean
}

const PRIORITIES: { value: TodoPriority; label: string; activeClass: string }[] = [
  { value: "LOW", label: "Low", activeClass: "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold" },
  { value: "MEDIUM", label: "Medium", activeClass: "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold" },
  { value: "HIGH", label: "High", activeClass: "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold" },
]

export function TodoForm({ onAdd, isSubmitting }: TodoFormProps) {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM")
  const [dueDate, setDueDate] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const titleId = useId()
  const descriptionId = useId()
  const dueDateId = useId()
  const errorId = useId()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateTitle(title)
    if (validationError) {
      setError(validationError)
      return
    }

    const saved = await onAdd({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
    })

    // Keep what the user typed if saving failed, so nothing is lost
    if (saved) {
      setTitle("")
      setDescription("")
      setPriority("MEDIUM")
      setDueDate("")
      setError(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Give it a title. Add details and priority if needed.</CardDescription>
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
