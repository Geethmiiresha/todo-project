import { act, renderHook, waitFor } from "@testing-library/react"
import { ApiError } from "@/services/api-client"
import { todoApi } from "@/services/todo-api"
import { useTodos } from "./use-todos"
import type { PaginatedTodosResponse, Todo, TodoSummary } from "@/types/todo"

vi.mock("@/services/todo-api", () => ({
  todoApi: {
    list: vi.fn(),
    summary: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clearCompleted: vi.fn(),
  },
}))

const task: Todo = {
  id: "todo-1",
  title: "Plan the week",
  description: "",
  completed: false,
  priority: "MEDIUM",
  dueDate: null,
}
const page: PaginatedTodosResponse = {
  data: [task],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
}
const summary: TodoSummary = { total: 1, completed: 0, active: 1 }

describe("useTodos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(todoApi.list).mockResolvedValue(page)
    vi.mocked(todoApi.summary).mockResolvedValue(summary)
    vi.mocked(todoApi.create).mockResolvedValue(task)
    vi.mocked(todoApi.update).mockResolvedValue({ ...task, completed: true })
    vi.mocked(todoApi.remove).mockResolvedValue(undefined)
    vi.mocked(todoApi.clearCompleted).mockResolvedValue(undefined)
  })

  it("loads todos and reports loading failures", async () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.status).toBe("loading")
    await waitFor(() => expect(result.current.status).toBe("ready"))
    expect(result.current.todos).toEqual([task])

    vi.mocked(todoApi.list).mockRejectedValueOnce(
      new ApiError("Network unavailable", 503),
    )
    await act(async () => {
      await result.current.reload()
    })
    expect(result.current.status).toBe("error")
    expect(result.current.loadError).toBe("Network unavailable")
  })

  it("sends current filters to the list API", async () => {
    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.status).toBe("ready"))

    act(() => result.current.setFilter("active"))

    await waitFor(() =>
      expect(todoApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "active" }),
      ),
    )
  })

  it("creates a todo and reloads the list", async () => {
    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.status).toBe("ready"))

    await act(async () => {
      await result.current.addTodo({ title: "Write tests" })
    })

    expect(todoApi.create).toHaveBeenCalledWith({ title: "Write tests" })
    expect(todoApi.list).toHaveBeenCalledTimes(2)
  })

  it("edits and deletes todos", async () => {
    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.status).toBe("ready"))

    await act(async () => {
      await result.current.updateTodo("todo-1", { title: "Updated task" })
    })
    expect(todoApi.update).toHaveBeenCalledWith("todo-1", {
      title: "Updated task",
    })

    await act(async () => {
      await result.current.deleteTodo("todo-1")
    })
    expect(todoApi.remove).toHaveBeenCalledWith("todo-1")
  })
})
