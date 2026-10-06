/**
 * Date formatting and overdue calculation utilities
 */

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const d = parseDate(dateStr)
  if (!d) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  const d = parseDate(dueDate)
  if (!d) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Compare end of due date against today's beginning
  const dueDay = new Date(d)
  dueDay.setHours(23, 59, 59, 999)

  return dueDay.getTime() < today.getTime()
}

export function isDueToday(dueDate: string | null | undefined): boolean {
  const d = parseDate(dueDate)
  if (!d) return false

  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function isDueTomorrow(dueDate: string | null | undefined): boolean {
  const d = parseDate(dueDate)
  if (!d) return false

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  )
}

export function formatDueDate(dueDate: string | null | undefined): string {
  const d = parseDate(dueDate)
  if (!d) return ""

  if (isDueToday(dueDate)) return "Today"
  if (isDueTomorrow(dueDate)) return "Tomorrow"

  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  })
}

