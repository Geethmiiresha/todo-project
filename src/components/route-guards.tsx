import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/context/auth-context"

function FullPageMessage({ children }: { children: string }) {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center text-muted-foreground">
      {children}
    </div>
  )
}

/** Only for logged-in users. Everyone else goes to /login. */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullPageMessage>Checking your session…</FullPageMessage>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

/** Login / Register pages: already logged-in users go to the Todos page. */
export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullPageMessage>Checking your session…</FullPageMessage>
  return user ? <Navigate to="/" replace /> : <Outlet />
}
