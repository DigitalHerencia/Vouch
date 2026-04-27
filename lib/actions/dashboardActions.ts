"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

const dashboardPreferencesSchema = z.object({
  status: z.enum(["action_required", "active", "pending", "completed", "expired", "refunded"]).optional(),
  sort: z.enum(["newest", "oldest", "deadline"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export type DashboardPreferencesResult = {
  userId: string
  status?: "action_required" | "active" | "pending" | "completed" | "expired" | "refunded"
  sort?: "newest" | "oldest" | "deadline"
  page?: number
}

export async function updateDashboardPreferences(input: unknown): Promise<ActionResult<DashboardPreferencesResult>> {
  const user = await requireActiveUser()
  const parsed = dashboardPreferencesSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the dashboard preference fields.",
      parsed.error.flatten().fieldErrors,
    )
  }

  revalidatePath("/dashboard")

  return actionSuccess({
    userId: user.id,
    ...parsed.data,
  })
}
