import "server-only"

import type { ZodError } from "zod"

import { actionFailure, type ActionResult, type FieldErrors } from "@/types/action-resultTypes"

export function toFieldErrors(error: ZodError): FieldErrors {
  return error.flatten().fieldErrors
}

export function toActionFailure(
  error: unknown,
  fallbackCode = "ACTION_FAILED",
  fallbackMessage = "We could not complete that action."
): ActionResult<never> {
  if (error instanceof Error) {
    return actionFailure(error.message || fallbackCode, fallbackMessage)
  }

  return actionFailure(fallbackCode, fallbackMessage)
}
