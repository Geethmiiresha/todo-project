import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail } from "lucide-react"

import { AuthLayout } from "@/components/auth-layout"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import { validateEmail } from "@/lib/validation"
import { authApi } from "@/services/auth-api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const emailErr = validateEmail(email)
    if (emailErr) {
      setError(emailErr)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setMessage(res.message)
    } catch (err) {
      setError(getErrorMessage(err, "Could not process request."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to request password reset instructions."
      footer={
        <>
          Remember your password?&nbsp;
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onValueChange={setEmail}
          error={error ?? undefined}
        />

        {message && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200">
            <p className="font-medium">{message}</p>
            <p className="mt-1">
              Email delivery must be configured by the application administrator.
            </p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          <Mail /> {isSubmitting ? "Sending instructions…" : "Send Reset Instructions"}
        </Button>
      </form>
    </AuthLayout>
  )
}
