interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-input px-6 py-12 text-center text-muted-foreground">
      {message}
    </div>
  )
}
