import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute, PublicOnlyRoute } from "@/components/route-guards"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/context/theme-context"
import LoginPage from "@/pages/login-page"
import RegisterPage from "@/pages/register-page"
import ForgotPasswordPage from "@/pages/forgot-password-page"
import ResetPasswordPage from "@/pages/reset-password-page"
import TodosPage from "@/pages/todos-page"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<TodosPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
