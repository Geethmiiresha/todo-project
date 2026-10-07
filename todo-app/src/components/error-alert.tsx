import { Button } from "@/components/ui/button"

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorAlert({ message, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p>{message}</p>
      {(onRetry || onDismiss) && (
        <div className="flex gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" className="text-foreground" onClick={onRetry}>
              Try again
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" className="text-foreground" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
