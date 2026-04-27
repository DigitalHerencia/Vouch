import "server-only"

import type { ZodError } from "zod"

import { actionFailure, type ActionResult, type FieldErrors } from "@/types/action-result"

export function toFieldErrors(error: ZodError): FieldErrors {
  return error.flatten().fieldErrors
}

export function toActionFailure(error: unknown, fallbackCode = "ACTION_FAILED", fallbackMessage = "We could not complete that action."): ActionResult<never> {
  if (error instanceof Error) {
    return actionFailure(error.message || fallbackCode, fallbackMessage)
  }

  return actionFailure(fallbackCode, fallbackMessage)
}

export function isRetryableProviderError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const maybe = error as { code?: unknown; statusCode?: unknown; type?: unknown }
  const code = typeof maybe.code === "string" ? maybe.code : ""
  const type = typeof maybe.type === "string" ? maybe.type : ""
  const statusCode = typeof maybe.statusCode === "number" ? maybe.statusCode : undefined

  return (
    statusCode === 408 ||
    statusCode === 409 ||
    statusCode === 425 ||
    statusCode === 429 ||
    Boolean(statusCode && statusCode >= 500) ||
    code === "rate_limit" ||
    code === "lock_timeout" ||
    type === "StripeConnectionError" ||
    type === "StripeAPIError"
  )
}
