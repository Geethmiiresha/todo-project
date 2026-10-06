import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Folder,
  ListTodo,
  Shield,
  UserCheck,
  Users,
  UserX,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { getErrorMessage } from "@/lib/errors"
import { adminApi } from "@/services/admin-api"
import type { AdminStats, AdminUser } from "@/types/auth"

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [actionUserId, setActionUserId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersData, statsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getStats(),
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load admin data."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      alert("You cannot disable your own admin account.")
      return
    }

    const nextStatus = !user.isActive
    setActionUserId(user.id)
    try {
      await adminApi.setUserStatus(user.id, nextStatus)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: nextStatus } : u)),
      )
      // Refresh stats
      const newStats = await adminApi.getStats()
      setStats(newStats)
    } catch (err) {
      alert(getErrorMessage(err, "Could not update user status."))
    } finally {
      setActionUserId(null)
    }
  }

  const completionRate =
    stats && stats.totalTodos > 0
      ? Math.round((stats.completedTodos / stats.totalTodos) * 100)
      : 0

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Top Navigation */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" /> Back to Taskboard
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Shield className="size-6 text-primary" /> Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage system users and view application metrics
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {stats?.activeUsers ?? 0} active
              </span>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {stats?.disabledUsers ?? 0} disabled
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTodos ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeTodos ?? 0} active across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.completedTodos ?? 0} completed tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Folder className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalCategories ?? 0) + (stats?.totalTags ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>{stats?.totalCategories ?? 0} categories</span>
              <span>•</span>
              <span>{stats?.totalTags ?? 0} tags</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View all registered users and control account access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Tasks</th>
                    <th className="py-3 px-4 font-medium">Joined</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id
                    const isBusy = actionUserId === u.id
                    return (
                      <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={u.role === "ADMIN" ? "high" : "secondary"}
                            className="text-[11px]"
                          >
                            {u.role === "ADMIN" && <Shield className="size-3" />}
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <UserCheck className="size-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                              <UserX className="size-3.5" /> Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {u.todosCount}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={u.isActive ? "outline" : "default"}
                            size="sm"
                            className="h-7 text-xs"
                            disabled={isSelf || isBusy}
                            onClick={() => handleToggleStatus(u)}
                            title={
                              isSelf
                                ? "You cannot disable your own account"
                                : u.isActive
                                  ? "Disable user access"
                                  : "Enable user access"
                            }
                          >
                            {isBusy
                              ? "Saving…"
                              : u.isActive
                                ? "Disable"
                                : "Enable"}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
