export type UserRole = "USER" | "ADMIN"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  todosCount: number
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  disabledUsers: number
  totalTodos: number
  completedTodos: number
  activeTodos: number
  totalCategories: number
  totalTags: number
}
