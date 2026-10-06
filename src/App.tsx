import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute, PublicOnlyRoute } from "@/components/route-guards"
import { AuthProvider } from "@/context/auth-context"
import LoginPage from "@/pages/login-page"
import RegisterPage from "@/pages/register-page"
import TodosPage from "@/pages/todos-page"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TodosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
