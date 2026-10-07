import { apiClient } from "@/services/api-client"
import type { AdminStats, AdminUser } from "@/types/auth"

export const adminApi = {
  getUsers: () => apiClient.get<AdminUser[]>("/admin/users"),

  setUserStatus: (id: string, isActive: boolean) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }),

  getStats: () => apiClient.get<AdminStats>("/admin/stats"),
}

