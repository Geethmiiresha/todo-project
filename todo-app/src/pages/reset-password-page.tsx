import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Check, KeyRound } from "lucide-react"

import { AuthLayout } from "@/components/auth-layout"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import { authApi } from "@/services/auth-api"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get("token") ?? ""

  const [token, setToken] = useState<string>(tokenFromUrl)
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError("Reset token is required.")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.resetPassword({ token: token.trim(), newPassword })
      setSuccess(res.message)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reset password. Token may be invalid or expired."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your reset token and choose a new password."
      footer={
        <>
          Remember your credentials?&nbsp;
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Reset Token"
          placeholder="Paste your reset token"
          value={token}
          onValueChange={setToken}
        />

        <FormField
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={newPassword}
          onValueChange={setNewPassword}
        />

        <FormField
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
        />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <Check className="size-4" />
            <span>{success} Redirecting to login…</span>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          <KeyRound /> {isSubmitting ? "Resetting…" : "Set New Password"}
        </Button>
      </form>
    </AuthLayout>
  )
}

