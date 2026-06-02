// lib/auth/redirects.ts

const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard"

export function isInternalPath(value: string | null | undefined): value is string {
  if (!value) return false
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://")
}

export function normalizeReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_AUTHENTICATED_REDIRECT
): string {
  if (!isInternalPath(value)) return fallback
  return value
}

export function sanitizePostAuthRedirect(value: string | null | undefined): string {
  return normalizeReturnTo(value)
}
