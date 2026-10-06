import { apiClient } from "@/services/api-client"
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category"

export const categoryApi = {
  list: () => apiClient.get<Category[]>("/categories"),

  create: (input: CreateCategoryInput) =>
    apiClient.post<Category>("/categories", input),

  update: (id: string, input: UpdateCategoryInput) =>
    apiClient.patch<Category>(`/categories/${id}`, input),

  remove: (id: string) => apiClient.delete<void>(`/categories/${id}`),
}

