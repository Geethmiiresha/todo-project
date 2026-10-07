import { apiClient } from "@/services/api-client"
import type { CreateTagInput, Tag } from "@/types/tag"

export const tagApi = {
  list: () => apiClient.get<Tag[]>("/tags"),

  create: (input: CreateTagInput) => apiClient.post<Tag>("/tags", input),

  remove: (id: string) => apiClient.delete<void>(`/tags/${id}`),
}

