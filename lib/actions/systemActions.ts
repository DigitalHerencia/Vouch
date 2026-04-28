"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { assertCapability } from "@/lib/authz/capabilities"
import { prisma } from "@/lib/db/prisma"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

const vouchRevalidateSchema = z.object({ vouchId: z.string().trim().min(1).max(128) })
const userVouchesRevalidateSchema = z.object({ userId: z.string().trim().min(1).max(128).optional() })
const operationalErrorSchema = z.object({
  eventName: z.string().trim().min(1).max(128).default("system.operational_error"),
  entityType: z.string().trim().min(1).max(128).default("System"),
  entityId: z.string().trim().min(1).max(128).default("system"),
  errorCode: z.string().trim().max(128).optional(),
  safeMessage: z.string().trim().max(500).optional(),
})

export async function healthcheck(): Promise<ActionResult<{ ok: true; checkedAt: string }>> {
  await prisma.$queryRaw`SELECT 1`
  return actionSuccess({ ok: true, checkedAt: new Date().toISOString() })
}

export async function revalidateVouchTags(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = vouchRevalidateSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the Vouch revalidation request.", parsed.error.flatten().fieldErrors)
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: { id: true, payerId: true, payeeId: true },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participant = vouch.payerId === user.id || vouch.payeeId === user.id
  if (!participant && !user.isAdmin) return actionFailure("AUTHZ_DENIED", "You cannot revalidate this Vouch.")

  revalidateTag(`vouch:${vouch.id}`)
  revalidatePath(`/vouches/${vouch.id}`)
  return actionSuccess({ vouchId: vouch.id })
}

export async function revalidateUserVouches(input?: unknown): Promise<ActionResult<{ userId: string }>> {
  const user = await requireActiveUser()
  const parsed = userVouchesRevalidateSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the user Vouch revalidation request.", parsed.error.flatten().fieldErrors)
  }

  const targetUserId = parsed.data.userId ?? user.id
  if (targetUserId !== user.id && !user.isAdmin) return actionFailure("AUTHZ_DENIED", "You cannot revalidate another user's Vouches.")

  revalidateTag(`user:${targetUserId}:vouches`)
  revalidatePath("/dashboard")
  revalidatePath("/vouches")
  return actionSuccess({ userId: targetUserId })
}

export async function revalidateAdminOperationalViews(): Promise<ActionResult<{ revalidated: true }>> {
  const user = await requireActiveUser()
  assertCapability(user, "view_admin_dashboard")
  revalidateTag("admin")
  revalidatePath("/admin")
  return actionSuccess({ revalidated: true })
}

export async function recordServerActionFailure(input: unknown): Promise<ActionResult<{ auditEventId: string }>> {
  return recordOperationalError(input)
}

export async function recordOperationalError(input: unknown): Promise<ActionResult<{ auditEventId: string }>> {
  const parsed = operationalErrorSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the operational error payload.", parsed.error.flatten().fieldErrors)
  }

  const audit = await prisma.auditEvent.create({
    data: {
      eventName: parsed.data.eventName,
      actorType: "system",
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      participantSafe: false,
      metadata: {
        error_code: parsed.data.errorCode,
        safe_message: parsed.data.safeMessage,
      },
    },
    select: { id: true },
  })

  return actionSuccess({ auditEventId: audit.id })
}
