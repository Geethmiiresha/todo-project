import { apiClient } from "@/services/api-client"
import type {
  AuthResponse,
  ChangePasswordInput,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from "@/types/auth"

export const authApi = {
  register: (input: RegisterInput) => apiClient.post<AuthResponse>("/auth/register", input),

  login: (input: LoginInput) => apiClient.post<AuthResponse>("/auth/login", input),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: () => apiClient.post<{ message: string }>("/auth/logout"),

  me: () => apiClient.get<User>("/auth/me"),

  changePassword: (input: ChangePasswordInput) =>
    apiClient.post<{ message: string }>("/auth/change-password", input),

  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", input),

  resetPassword: (input: ResetPasswordInput) =>
    apiClient.post<{ message: string }>("/auth/reset-password", input),
}
