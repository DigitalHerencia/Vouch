"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

const dashboardStatusSchema = z.enum([
  "action_required",
  "active",
  "pending",
  "completed",
  "expired",
  "refunded",
])

const dashboardSortSchema = z.enum(["newest", "oldest", "deadline"])

const dashboardPreferencesSchema = z.object({
  status: dashboardStatusSchema.optional(),
  sort: dashboardSortSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})

type FieldErrors = Record<string, string[]>

type DashboardStatus = z.infer<typeof dashboardStatusSchema>
type DashboardSort = z.infer<typeof dashboardSortSchema>

export type DashboardPreferencesResult = {
  userId: string
  status: DashboardStatus | null
  sort: DashboardSort | null
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
