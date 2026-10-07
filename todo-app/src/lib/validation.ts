export const TITLE_MAX_LENGTH = 80
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns an error message, or null when the title is valid. */
export function validateTitle(title: string): string | null {
  const trimmed = title.trim()
  if (trimmed.length === 0) return "Enter a title for your task."
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return `Keep the title under ${TITLE_MAX_LENGTH} characters.`
  }
  return null
}

export function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "Enter your name."
  if (trimmed.length > 80) return "Keep your name under 80 characters."
  return null
}

export function validateEmail(email: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address."
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`
  }
  return null
}
