"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@/prisma/generated/prisma/client"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCapability } from "@/lib/auth/authorization/capabilities"
import { prisma } from "@/lib/db/prisma"
import { dispatchQueuedNotification } from "@/lib/actions/notificationQueueActions"
import { runPaymentReconciliationJob } from "@/lib/actions/reconcilePaymentActions"
import { processPaymentWebhookEvent, reconcileRefundStatus } from "@/lib/actions/paymentActions"
import { adminDisableUserInputSchema, adminSafeRetryInputSchema } from "@/schemas/admin"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { AdminSafeRetryInput } from "@/types/admin"

type AdminAuditInput = {
  entityType?: string
  entityId?: string
  eventName?: string
  reason?: string
  metadata?: Record<string, unknown>
}

type SafeRetryResult = {
  operation: AdminSafeRetryInput["operation"]
  entityId: string
  recordedAt: string
  status?: "completed" | "failed" | "skipped"
}

function adminValidationFailure(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return actionFailure("VALIDATION_FAILED", message, fieldErrors)
}

async function requireAdminForAction(
  capability: "retry_safe_technical_operation" | "disable_user_account"
) {
  const user = await requireActiveUser()
  assertCapability(user, capability)
  return user
}

async function writeAdminAudit(input: {
  actorUserId: string
  eventName:
    | "admin.user.viewed"
    | "admin.vouch.viewed"
    | "admin.payment.viewed"
    | "admin.retry.started"
    | "admin.retry.completed"
    | "admin.account.disabled"
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
}) {
  return prisma.auditEvent.create({
    data: {
      eventName: input.eventName,
      actorType: "admin",
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      participantSafe: false,
      ...(input.metadata ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
    },
  })
}

async function runSafeRetryOperation(input: {
  operation: AdminSafeRetryInput["operation"]
  entityId: string
  reason?: string
}) {
  switch (input.operation) {
    case "retry_notification_send":
      await dispatchQueuedNotification({ notificationEventId: input.entityId })
      return "completed" as const
    case "retry_provider_reconciliation":
      await runPaymentReconciliationJob({ limit: 25 })
      return "completed" as const
    case "retry_webhook_processing":
      await processPaymentWebhookEvent({
        providerEventId: input.entityId,
        eventType: "manual_admin_retry",
      })
      return "completed" as const
    case "retry_refund_status_sync":
      await reconcileRefundStatus({ vouchId: input.entityId })
      return "completed" as const
  }
}

export async function disableUserAccount(
  input: unknown
): Promise<ActionResult<{ userId: string }>> {
  const admin = await requireAdminForAction("disable_user_account")
  const parsed = adminDisableUserInputSchema.safeParse(input)

  if (!parsed.success) {
    return adminValidationFailure(
      "Check the account disable request.",
      parsed.error.flatten().fieldErrors
    )
  }

  if (parsed.data.userId === admin.id) {
    return actionFailure("SELF_DISABLE_BLOCKED", "Admins cannot disable their own account.")
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: parsed.data.userId },
      data: { status: "disabled" },
      select: { id: true },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.account.disabled",
        actorType: "admin",
        actorUserId: admin.id,
        entityType: "user",
        entityId: user.id,
        participantSafe: false,
        metadata: { reason: parsed.data.reason },
      },
    })

    return user
  })

  revalidatePath("/admin")
  revalidatePath("/admin/users")

  return actionSuccess({ userId: updated.id })
}

export async function retryNotificationSend(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  return recordAdminSafeRetryCompleted({
    ...(typeof input === "object" && input ? input : {}),
    operation: "retry_notification_send",
  })
}

export async function retryProviderReconciliation(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  return recordAdminSafeRetryCompleted({
    ...(typeof input === "object" && input ? input : {}),
    operation: "retry_provider_reconciliation",
  })
}

export async function retryWebhookProcessing(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  return recordAdminSafeRetryCompleted({
    ...(typeof input === "object" && input ? input : {}),
    operation: "retry_webhook_processing",
  })
}

export async function retryRefundStatusSync(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  return recordAdminSafeRetryCompleted({
    ...(typeof input === "object" && input ? input : {}),
    operation: "retry_refund_status_sync",
  })
}

export async function recordAdminViewAuditEvent(
  input: AdminAuditInput
): Promise<ActionResult<{ auditEventId: string }>> {
  const admin = await requireAdminForAction("retry_safe_technical_operation")
  const entityId = input.entityId?.trim()
  const entityType = input.entityType?.trim() ?? "admin_view"

  if (!entityId) {
    return actionFailure("VALIDATION_FAILED", "Admin view audit requires an entity id.")
  }

  const eventName =
    input.eventName === "admin.vouch.viewed" ||
    input.eventName === "admin.payment.viewed" ||
    input.eventName === "admin.user.viewed"
      ? input.eventName
      : "admin.vouch.viewed"

  const audit = await writeAdminAudit({
    actorUserId: admin.id,
    eventName,
    entityType,
    entityId,
  })

  return actionSuccess({ auditEventId: audit.id })
}

export async function recordAdminSafeRetryStarted(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  const admin = await requireAdminForAction("retry_safe_technical_operation")
  const parsed = adminSafeRetryInputSchema.safeParse(input)

  if (!parsed.success) {
    return adminValidationFailure(
      "Check the safe retry request.",
      parsed.error.flatten().fieldErrors
    )
  }

  await writeAdminAudit({
    actorUserId: admin.id,
    eventName: "admin.retry.started",
    entityType: "admin_safe_retry",
    entityId: parsed.data.entityId,
    metadata: {
      operation: parsed.data.operation,
      reason: parsed.data.reason,
    },
  })

  revalidatePath("/admin")

  return actionSuccess({
    operation: parsed.data.operation,
    entityId: parsed.data.entityId,
    recordedAt: new Date().toISOString(),
  })
}

export async function recordAdminSafeRetryCompleted(
  input: unknown
): Promise<ActionResult<SafeRetryResult>> {
  const admin = await requireAdminForAction("retry_safe_technical_operation")
  const parsed = adminSafeRetryInputSchema.safeParse(input)

  if (!parsed.success) {
    return adminValidationFailure(
      "Check the safe retry completion request.",
      parsed.error.flatten().fieldErrors
    )
  }

  const retry = await prisma.operationalRetry.create({
    data: {
      operation: parsed.data.operation,
      status: "started",
      entityType: "admin_safe_retry",
      entityId: parsed.data.entityId,
      adminUserId: admin.id,
      reason: parsed.data.reason ?? null,
    },
    select: { id: true },
  })

  let status: "completed" | "failed" | "skipped" = "completed"
  let errorCode: string | undefined

  try {
    status = await runSafeRetryOperation({
      operation: parsed.data.operation,
      entityId: parsed.data.entityId,
      ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
    })
  } catch (error) {
    status = "failed"
    errorCode = error instanceof Error ? error.message.slice(0, 200) : "SAFE_RETRY_FAILED"
  }

  await prisma.$transaction(async (tx) => {
    await tx.operationalRetry.update({
      where: { id: retry.id },
      data: {
        status,
        completedAt: new Date(),
        ...(errorCode ? { errorCode } : {}),
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.retry.started",
        actorType: "admin",
        actorUserId: admin.id,
        entityType: "admin_safe_retry",
        entityId: parsed.data.entityId,
        participantSafe: false,
        metadata: {
          operation: parsed.data.operation,
          reason: parsed.data.reason,
        },
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.retry.completed",
        actorType: "admin",
        actorUserId: admin.id,
        entityType: "admin_safe_retry",
        entityId: parsed.data.entityId,
        participantSafe: false,
        metadata: {
          operation: parsed.data.operation,
          reason: parsed.data.reason,
          outcome: status,
          ...(errorCode ? { error_code: errorCode } : {}),
        },
      },
    })
  })

  revalidatePath("/admin")

  return actionSuccess({
    operation: parsed.data.operation,
    entityId: parsed.data.entityId,
    recordedAt: new Date().toISOString(),
    status,
  })
}
