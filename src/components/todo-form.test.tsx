import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TodoForm } from "./todo-form"
import type { TodoDraft } from "@/types/todo"

describe("TodoForm", () => {
  const onAdd = vi.fn<(draft: TodoDraft) => Promise<boolean>>()

  beforeEach(() => {
    onAdd.mockReset().mockResolvedValue(true)
  })

  it("validates a blank title before creating a todo", async () => {
    const user = userEvent.setup()
    render(
      <TodoForm
        categories={[]}
        tags={[]}
        onAddCategory={vi.fn()}
        onAddTag={vi.fn()}
        onAdd={onAdd}
        isSubmitting={false}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Add task" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a title")
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("submits a normalized todo and clears the form after success", async () => {
    const user = userEvent.setup()
    render(
      <TodoForm
        categories={[]}
        tags={[]}
        onAddCategory={vi.fn()}
        onAddTag={vi.fn()}
        onAdd={onAdd}
        isSubmitting={false}
      />,
    )

    await user.type(screen.getByLabelText("Title"), "  Plan the week  ")
    await user.type(screen.getByLabelText(/Description/), "  Weekly planning  ")
    await user.click(screen.getByRole("button", { name: "Add task" }))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Plan the week",
        description: "Weekly planning",
        priority: "MEDIUM",
      }),
    )
    expect(screen.getByLabelText("Title")).toHaveValue("")
  })
})
