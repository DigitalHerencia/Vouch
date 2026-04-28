export const PUBLIC_ROUTES = [
  "/",
  "/how-it-works",
  "/pricing",
  "/faq",
  "/legal/terms",
  "/legal/privacy",
  "/sign-in",
  "/sign-up",
] as const

export const PROTECTED_APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/setup",
  "/settings",
  "/vouches",
] as const

export const ADMIN_ROUTE_PREFIX = "/admin"

export const PUBLIC_DYNAMIC_ROUTE_PATTERNS = [
  /^\/vouches\/invite\/[^/]+$/,
  /^\/api\/webhooks\/clerk$/,
  /^\/api\/webhooks\/stripe$/,
] as const

export function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]) ||
    PUBLIC_DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
  )
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
}

export function isProtectedAppRoute(pathname: string): boolean {
  return PROTECTED_APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
