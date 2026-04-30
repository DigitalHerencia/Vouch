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
  return_to?: string | string[] | undefined
  returnTo?: string | string[] | undefined
}): string {
  const returnToSnake = first(searchParams.return_to)
  const returnToCamel = first(searchParams.returnTo)
  const redirectUrlCamel = first(searchParams.redirectUrl)
  const redirectUrlSnake = first(searchParams.redirect_url)

  return normalizeReturnTo(returnToSnake ?? returnToCamel ?? redirectUrlCamel ?? redirectUrlSnake)
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
