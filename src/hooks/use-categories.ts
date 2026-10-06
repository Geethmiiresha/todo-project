import { useCallback, useEffect, useState } from "react"
import { categoryApi } from "@/services/category-api"
import type { Category, CreateCategoryInput } from "@/types/category"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await categoryApi.list()
      setCategories(data)
    } catch {
      setError("Could not load categories")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addCategory = async (input: CreateCategoryInput): Promise<Category | null> => {
    try {
      const created = await categoryApi.create(input)
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    } catch {
      return null
    }
  }

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await categoryApi.remove(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      return true
    } catch {
      return false
    }
  }

  return {
    categories,
    isLoading,
    error,
    reload: load,
    addCategory,
    deleteCategory,
  }
}

