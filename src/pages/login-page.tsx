import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { LogIn } from "lucide-react"

import { AuthLayout } from "@/components/auth-layout"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { getErrorMessage } from "@/lib/errors"
import { validateEmail } from "@/lib/validation"

interface LoginErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const { login, sessionExpired } = useAuth()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const nextErrors: LoginErrors = {}
    const emailError = validateEmail(email)
    if (emailError) nextErrors.email = emailError
    if (password.length === 0) nextErrors.password = "Enter your password."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
    } catch (error) {
      setFormError(getErrorMessage(error, "Something went wrong. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your tasks."
      footer={
        <>
          Don't have an account?&nbsp;
          <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {sessionExpired && (
          <p role="status" className="rounded-md border border-accent bg-accent/30 px-3 py-2 text-sm">
            Your session expired. Please sign in again.
          </p>
        )}

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onValueChange={setEmail}
          error={errors.email}
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Password</span>
            <Link
              to="/forgot-password"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <FormField
            label=""
            type="password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            error={errors.password}
          />
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          <LogIn />
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  )
}
