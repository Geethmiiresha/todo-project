import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { ApiError } from "@/services/api-client"
import LoginPage from "./login-page"

vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}))

describe("LoginPage", () => {
  const login = vi.fn()

  beforeEach(() => {
    login.mockReset().mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      sessionExpired: false,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
    })
  })

  function renderLogin() {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
  }

  it("shows form validation errors without sending a request", async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument()
    expect(screen.getByText("Enter your password.")).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it("normalizes email and submits login credentials", async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText("Email"), " Alex@Example.com ")
    await user.type(screen.getByLabelText("Password"), "correct-password")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(login).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "correct-password",
    })
  })

  it("displays rejected login requests", async () => {
    const user = userEvent.setup()
    login.mockRejectedValueOnce(
      new ApiError("Invalid email or password", 401),
    )
    renderLogin()
    await user.type(screen.getByLabelText("Email"), "alex@example.com")
    await user.type(screen.getByLabelText("Password"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    )
  })
})
