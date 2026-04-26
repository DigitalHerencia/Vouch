import { normalizeReturnTo } from "./redirects"

export function sanitizePostAuthRedirect(value: string | null | undefined): string {
  return normalizeReturnTo(value)
}
