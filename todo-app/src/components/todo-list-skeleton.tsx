export function TodoListSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only">Loading tasks…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-22 animate-pulse rounded-lg border bg-card motion-reduce:animate-none"
        />
      ))}
    </div>
  )
}
