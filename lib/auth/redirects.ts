const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard"

const INTERNAL_PATH_PATTERN = /^\/(?!\/)(?!.*:\/\/).*/

export function isInternalPath(value: string | null | undefined): value is string {
  if (!value) return false
  return INTERNAL_PATH_PATTERN.test(value)
}

export function normalizeReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_AUTHENTICATED_REDIRECT
): string {
  if (!isInternalPath(value)) return fallback
  return value
}

export function getPostAuthRedirect(searchParams: {
  redirect_url?: string | string[] | undefined
  redirectUrl?: string | string[] | undefined
  returnTo?: string | string[] | undefined
}): string {
  const returnTo = first(searchParams.returnTo)
  const redirectUrl = first(searchParams.redirectUrl)
  const redirect_url = first(searchParams.redirect_url)

  return normalizeReturnTo(returnTo ?? redirectUrl ?? redirect_url)
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
