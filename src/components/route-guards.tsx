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

/** Only for ADMIN users. Non-admins go to /. */
export function AdminRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullPageMessage>Checking your session…</FullPageMessage>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "ADMIN") return <Navigate to="/" replace />
  return <Outlet />
}

/** Login / Register / Forgot / Reset pages: already logged-in users go to the Todos page. */
export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullPageMessage>Checking your session…</FullPageMessage>
  return user ? <Navigate to="/" replace /> : <Outlet />
}
