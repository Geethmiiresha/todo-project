import { useCallback, useEffect, useState } from "react"
import { tagApi } from "@/services/tag-api"
import type { CreateTagInput, Tag } from "@/types/tag"

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tagApi.list()
      setTags(data)
    } catch {
      setError("Could not load tags")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addTag = async (input: CreateTagInput): Promise<Tag | null> => {
    try {
      const created = await tagApi.create(input)
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    } catch {
      return null
    }
  }

  const deleteTag = async (id: string): Promise<boolean> => {
    try {
      await tagApi.remove(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch {
      return false
    }
  }

  return {
    tags,
    isLoading,
    error,
    reload: load,
    addTag,
    deleteTag,
  }
}

