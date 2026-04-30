"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { dashboardPreferencesSchema } from "@/schemas/dashboard"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

type FieldErrors = Record<string, string[]>

type DashboardPreferences = z.infer<typeof dashboardPreferencesSchema>

export type DashboardPreferencesResult = {
  userId: string
  status: DashboardPreferences["status"] | null
  sort: DashboardPreferences["sort"] | null
  page: number | null
}

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= []
    fieldErrors[field].push(issue.message)
  }

  return fieldErrors
}

export async function updateDashboardPreferences(
  input: unknown
): Promise<ActionResult<DashboardPreferencesResult>> {
  const user = await requireActiveUser()
  const parsed = dashboardPreferencesSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the dashboard preference fields.",
      getFieldErrors(parsed.error)
    )
  }

  revalidatePath("/dashboard")

  return actionSuccess({
    userId: user.id,
    status: parsed.data.status ?? null,
    sort: parsed.data.sort ?? null,
    page: parsed.data.page ?? null,
  })
}
