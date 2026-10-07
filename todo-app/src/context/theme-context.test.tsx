import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { ThemeProvider, useTheme } from "./theme-context"

function ThemeButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
  })

  it("switches modes and remembers the selected theme", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>,
    )

    expect(screen.getByRole("button")).toHaveTextContent("light")

    await user.click(screen.getByRole("button"))

    expect(screen.getByRole("button")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveClass("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
    expect(window.localStorage.getItem("taskboard-theme")).toBe("dark")
  })

  it("restores the previously selected dark theme", () => {
    window.localStorage.setItem("taskboard-theme", "dark")

    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>,
    )

    expect(screen.getByRole("button")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveClass("dark")
  })
})
