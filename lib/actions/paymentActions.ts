"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { assertCapability } from "@/lib/authz/capabilities"
import { prisma } from "@/lib/db/prisma"
import {
  initializeStripePaymentForVouch,
  refundOrVoidStripePaymentForVouch,
  releaseStripePaymentForCompletedVouch,
} from "@/lib/payments/adapters/stripe-payment-adapter"
import {
  authorizeVouchPaymentInputSchema,
  captureOrReleaseVouchPaymentInputSchema,
  initializeVouchPaymentInputSchema,
  paymentFailureInputSchema,
  paymentProviderReturnInputSchema,
  paymentWebhookEnvelopeSchema,
  paymentWebhookProcessInputSchema,
  refundOrVoidVouchPaymentInputSchema,
  startPaymentMethodSetupInputSchema,
  startPayoutOnboardingInputSchema,
} from "@/schemas/payment"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

type FieldErrors = Record<string, string[]>

type PaymentActionResult = {
  paymentRecordId: string
  vouchId: string
  status:
    | "not_started"
    | "requires_payment_method"
    | "authorized"
    | "captured"
    | "release_pending"
    | "released"
    | "refund_pending"
    | "refunded"
    | "voided"
    | "failed"
}

type RefundActionResult = {
  refundRecordId: string
  vouchId: string
  status: "not_required" | "pending" | "succeeded" | "failed"
}

type ReadinessResult = {
  userId: string
  readiness: "not_started" | "requires_action" | "ready" | "restricted" | "failed"
}

type ProviderRedirectResult = {
  redirectTo: string
}

type WebhookRecordResult = {
  providerWebhookEventId: string
  paymentWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
}

const paymentReadinessSchema = z.object({
  userId: z.string().trim().min(1).optional(),
})

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

function normalizeInternalReturnTo(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//")) return fallback
  if (value.includes("://")) return fallback
  return value
}

async function revalidatePaymentSurfaces(input: {
  userId?: string | null
  vouchId?: string | null
  paymentRecordId?: string | null
}): Promise<void> {
  revalidatePath("/settings")
  revalidatePath("/settings/payment")
  revalidatePath("/settings/payout")
  revalidatePath("/setup")
  revalidatePath("/dashboard")
  revalidatePath("/vouches")

  if (input.vouchId) {
    revalidatePath(`/vouches/${input.vouchId}`)
    revalidatePath(`/vouches/${input.vouchId}/confirm`)
  }

  if (input.paymentRecordId) {
    revalidatePath("/admin/payments")
  }
}

function paymentResult(record: {
  id: string
  vouchId: string
  status:
    | "not_started"
    | "requires_payment_method"
    | "authorized"
    | "captured"
    | "release_pending"
    | "released"
    | "refund_pending"
    | "refunded"
    | "voided"
    | "failed"
}): PaymentActionResult {
  return {
    paymentRecordId: record.id,
    vouchId: record.vouchId,
    status: record.status,
  }
}

function refundResult(record: {
  id: string
  vouchId: string
  status: "not_required" | "pending" | "succeeded" | "failed"
}): RefundActionResult {
  return {
    refundRecordId: record.id,
    vouchId: record.vouchId,
    status: record.status,
  }
}

async function getParticipantPaymentRecord(input: { vouchId: string; userId: string }) {
  return prisma.paymentRecord.findUnique({
    where: { vouchId: input.vouchId },
    select: {
      id: true,
      vouchId: true,
      status: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      providerPaymentId: true,
      vouch: {
        select: {
          id: true,
          payerId: true,
          payeeId: true,
          amountCents: true,
          currency: true,
          platformFeeCents: true,
          status: true,
        },
      },
    },
  })
}

function canAccessPaymentRecord(
  record: Awaited<ReturnType<typeof getParticipantPaymentRecord>>,
  userId: string
) {
  if (!record) return false
  return record.vouch.payerId === userId || record.vouch.payeeId === userId
}

export async function startPaymentMethodSetup(
  input?: unknown
): Promise<ActionResult<ProviderRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = startPaymentMethodSetupInputSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment setup fields.",
      getFieldErrors(parsed.error)
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        paymentReadiness: "requires_action",
      },
      update: {
        paymentReadiness: "requires_action",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "setup.payment_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "PaymentCustomer",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          provider: "stripe",
        },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })

  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/payment")
  redirect(`/settings/payment?returnTo=${encodeURIComponent(returnTo)}`)
}

export async function handlePaymentMethodSetupReturn(
  input: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentProviderReturnInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment provider return fields.",
      getFieldErrors(parsed.error)
    )
  }

  if (parsed.data.provider !== "stripe") {
    return actionFailure("UNSUPPORTED_PROVIDER", "Unsupported payment provider.")
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        paymentReadiness: "ready",
      },
      update: {
        paymentReadiness: "ready",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "user.payment_method.added",
        actorType: "user",
        actorUserId: user.id,
        entityType: "PaymentCustomer",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          provider: parsed.data.provider,
          ...(parsed.data.setupSessionId ? { setup_session_id: parsed.data.setupSessionId } : {}),
        },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })

  return actionSuccess({
    userId: user.id,
    readiness: "ready",
  })
}

export async function refreshPaymentReadiness(
  input?: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentReadinessSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment readiness fields.",
      getFieldErrors(parsed.error)
    )
  }

  const targetUserId = parsed.data.userId ?? user.id

  if (targetUserId !== user.id && !user.isAdmin) {
    return actionFailure("AUTHZ_DENIED", "You cannot refresh another user's payment readiness.")
  }

  const profile = await prisma.verificationProfile.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
    },
    update: {},
    select: {
      paymentReadiness: true,
    },
  })

  await revalidatePaymentSurfaces({ userId: targetUserId })

  return actionSuccess({
    userId: targetUserId,
    readiness: profile.paymentReadiness,
  })
}

export async function startPayoutOnboarding(
  input?: unknown
): Promise<ActionResult<ProviderRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = startPayoutOnboardingInputSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payout setup fields.",
      getFieldErrors(parsed.error)
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        payoutReadiness: "requires_action",
      },
      update: {
        payoutReadiness: "requires_action",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "setup.payout_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "ConnectedAccount",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          provider: "stripe",
        },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })

  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/payout")
  redirect(`/settings/payout?returnTo=${encodeURIComponent(returnTo)}`)
}

export async function handlePayoutOnboardingReturn(
  input: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentProviderReturnInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payout provider return fields.",
      getFieldErrors(parsed.error)
    )
  }

  if (parsed.data.provider !== "stripe") {
    return actionFailure("UNSUPPORTED_PROVIDER", "Unsupported payout provider.")
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        payoutReadiness: "ready",
      },
      update: {
        payoutReadiness: "ready",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "user.connected_account.ready",
        actorType: "user",
        actorUserId: user.id,
        entityType: "ConnectedAccount",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          provider: parsed.data.provider,
          ...(parsed.data.setupSessionId ? { setup_session_id: parsed.data.setupSessionId } : {}),
        },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })

  return actionSuccess({
    userId: user.id,
    readiness: "ready",
  })
}

export async function refreshPayoutReadiness(
  input?: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentReadinessSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payout readiness fields.",
      getFieldErrors(parsed.error)
    )
  }

  const targetUserId = parsed.data.userId ?? user.id

  if (targetUserId !== user.id && !user.isAdmin) {
    return actionFailure("AUTHZ_DENIED", "You cannot refresh another user's payout readiness.")
  }

  const profile = await prisma.verificationProfile.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
    },
    update: {},
    select: {
      payoutReadiness: true,
    },
  })

  await revalidatePaymentSurfaces({ userId: targetUserId })

  return actionSuccess({
    userId: targetUserId,
    readiness: profile.payoutReadiness,
  })
}

export async function initializeVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult & { clientSecret: string | null }>> {
  const user = await requireActiveUser()
  const parsed = initializeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment initialization fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      paymentRecord: {
        select: {
          id: true,
          status: true,
        },
      },
      payer: {
        select: {
          paymentCustomer: {
            select: {
              providerCustomerId: true,
            },
          },
        },
      },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.payerId !== user.id) return actionFailure("AUTHZ_DENIED", "Payer access required.")

  const initialized = await initializeStripePaymentForVouch({
    vouchId: vouch.id,
    amountCents: vouch.amountCents,
    currency: vouch.currency,
    platformFeeCents: vouch.platformFeeCents,
    ...(vouch.payer.paymentCustomer?.providerCustomerId
      ? { providerCustomerId: vouch.payer.paymentCustomer.providerCustomerId }
      : {}),
  })

  if (!initialized.ok) {
    await markPaymentFailed({
      vouchId: vouch.id,
      failureStage: "create",
      failureCode: initialized.code,
      safeMessage: initialized.message,
    })

    return actionFailure(initialized.code, initialized.message)
  }

  const record = await prisma.paymentRecord.findUnique({
    where: { vouchId: vouch.id },
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  if (!record) return actionFailure("PAYMENT_RECORD_NOT_READY", "Payment record was not created.")

  await prisma.auditEvent.create({
    data: {
      eventName: "payment.initialized",
      actorType: "system",
      entityType: "PaymentRecord",
      entityId: record.id,
      participantSafe: true,
      metadata: {
        vouch_id: vouch.id,
        provider: "stripe",
        amount_cents: vouch.amountCents,
        platform_fee_cents: vouch.platformFeeCents,
      },
    },
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: vouch.id,
    paymentRecordId: record.id,
  })

  return actionSuccess({
    ...paymentResult(record),
    clientSecret: initialized.clientSecret ?? null,
  })
}

export async function authorizeVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  const parsed = authorizeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment authorization fields.",
      getFieldErrors(parsed.error)
    )
  }

  const record = await getParticipantPaymentRecord({
    vouchId: parsed.data.vouchId,
    userId: user.id,
  })

  if (!record) return actionFailure("NOT_FOUND", "Payment record not found.")
  if (!canAccessPaymentRecord(record, user.id))
    return actionFailure("AUTHZ_DENIED", "Participant access required.")

  const updated = await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.update({
      where: { id: record.id },
      data: {
        status: "authorized",
        lastErrorCode: null,
      },
      select: {
        id: true,
        vouchId: true,
        status: true,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.authorized",
        actorType: "system",
        entityType: "PaymentRecord",
        entityId: payment.id,
        participantSafe: true,
        metadata: {
          vouch_id: payment.vouchId,
          provider: "stripe",
        },
      },
    })

    return payment
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: updated.vouchId,
    paymentRecordId: updated.id,
  })

  return actionSuccess(paymentResult(updated))
}

export async function captureOrReleaseVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  const parsed = captureOrReleaseVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment release fields.",
      getFieldErrors(parsed.error)
    )
  }

  const record = await getParticipantPaymentRecord({
    vouchId: parsed.data.vouchId,
    userId: user.id,
  })

  if (!record) return actionFailure("NOT_FOUND", "Payment record not found.")
  if (!canAccessPaymentRecord(record, user.id))
    return actionFailure("AUTHZ_DENIED", "Participant access required.")

  const aggregate = await prisma.presenceConfirmation.groupBy({
    by: ["participantRole"],
    where: {
      vouchId: parsed.data.vouchId,
      status: "confirmed",
    },
  })

  const confirmedRoles = new Set(aggregate.map((item) => item.participantRole))
  const bothConfirmed = confirmedRoles.has("payer") && confirmedRoles.has("payee")

  if (!bothConfirmed) {
    return actionFailure(
      "DUAL_CONFIRMATION_REQUIRED",
      "Both parties must confirm before funds release."
    )
  }

  if (!record.vouch.payeeId) {
    return actionFailure("PAYEE_REQUIRED", "Payee is required before funds release.")
  }

  const release = await releaseStripePaymentForCompletedVouch({
    paymentRecordId: record.id,
  })

  if (!release.ok) {
    await markPaymentFailed({
      vouchId: record.vouchId,
      paymentRecordId: record.id,
      failureStage: "release",
      failureCode: release.code,
      safeMessage: release.message,
    })

    return actionFailure(release.code, release.message)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.update({
      where: { id: record.id },
      data: {
        status: "released",
        lastErrorCode: null,
      },
      select: {
        id: true,
        vouchId: true,
        status: true,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.released",
        actorType: "system",
        entityType: "PaymentRecord",
        entityId: payment.id,
        participantSafe: true,
        metadata: {
          vouch_id: payment.vouchId,
          provider: "stripe",
          amount_cents: record.amountCents,
        },
      },
    })

    return payment
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: updated.vouchId,
    paymentRecordId: updated.id,
  })

  return actionSuccess(paymentResult(updated))
}

export async function refundOrVoidVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  const parsed = refundOrVoidVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the refund fields.",
      getFieldErrors(parsed.error)
    )
  }

  const record = await getParticipantPaymentRecord({
    vouchId: parsed.data.vouchId,
    userId: user.id,
  })

  if (!record) return actionFailure("NOT_FOUND", "Payment record not found.")
  if (record.vouch.payerId !== user.id && !user.isAdmin) {
    return actionFailure("AUTHZ_DENIED", "Payer or admin access required.")
  }

  const result = await refundOrVoidStripePaymentForVouch({
    paymentRecordId: record.id,
    reason: "provider_required",
  })

  if (!result.ok) {
    await markPaymentFailed({
      vouchId: record.vouchId,
      paymentRecordId: record.id,
      failureStage: "refund",
      failureCode: result.code,
      safeMessage: result.message,
    })

    return actionFailure(result.code, result.message)
  }

  const updated = await prisma.paymentRecord.findUnique({
    where: { id: record.id },
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  if (!updated)
    return actionFailure("PAYMENT_RECORD_NOT_READY", "Payment record not found after refund.")

  await prisma.auditEvent.create({
    data: {
      eventName: "payment.refund_requested",
      actorType: "system",
      entityType: "PaymentRecord",
      entityId: updated.id,
      participantSafe: true,
      metadata: {
        vouch_id: updated.vouchId,
        reason: "provider_required",
      },
    },
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: updated.vouchId,
    paymentRecordId: updated.id,
  })

  return actionSuccess(paymentResult(updated))
}

export async function handleStripeWebhook(
  input: unknown
): Promise<ActionResult<WebhookRecordResult>> {
  const recorded = await recordPaymentWebhookEvent(input)

  if (!recorded.ok) {
    return recorded
  }

  return processPaymentWebhookEvent({
    providerEventId: recorded.data.providerEventId,
    eventType: recorded.data.eventType,
  })
}

export async function recordPaymentWebhookEvent(
  input: unknown
): Promise<ActionResult<WebhookRecordResult>> {
  const parsed = paymentWebhookEnvelopeSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Stripe webhook event envelope.",
      getFieldErrors(parsed.error)
    )
  }

  const recorded = await prisma.$transaction(async (tx) => {
    const provider = await tx.providerWebhookEvent.upsert({
      where: {
        provider_providerEventId: {
          provider: "stripe",
          providerEventId: parsed.data.id,
        },
      },
      create: {
        provider: "stripe",
        providerEventId: parsed.data.id,
        eventType: parsed.data.type,
        status: "received",
        processed: false,
        safeMetadata: {
          event_type: parsed.data.type,
        },
      },
      update: {},
      select: {
        id: true,
        providerEventId: true,
        eventType: true,
        processed: true,
      },
    })

    const payment = await tx.paymentWebhookEvent.upsert({
      where: {
        providerEventId: parsed.data.id,
      },
      create: {
        provider: "stripe",
        providerEventId: parsed.data.id,
        eventType: parsed.data.type,
        providerWebhookEventId: provider.id,
        processed: false,
        safeMetadata: {
          event_type: parsed.data.type,
        },
      },
      update: {},
      select: {
        id: true,
        providerEventId: true,
        eventType: true,
        processed: true,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.webhook_received",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: payment.id,
        participantSafe: false,
        metadata: {
          provider_event_id: parsed.data.id,
          event_type: parsed.data.type,
        },
      },
    })

    return { provider, payment }
  })

  return actionSuccess({
    providerWebhookEventId: recorded.provider.id,
    paymentWebhookEventId: recorded.payment.id,
    providerEventId: recorded.payment.providerEventId,
    eventType: recorded.payment.eventType,
    processed: recorded.payment.processed,
  })
}

export async function processPaymentWebhookEvent(
  input: unknown
): Promise<ActionResult<WebhookRecordResult>> {
  const parsed = paymentWebhookProcessInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Stripe webhook process fields.",
      getFieldErrors(parsed.error)
    )
  }

  const webhook = await prisma.paymentWebhookEvent.findUnique({
    where: { providerEventId: parsed.data.providerEventId },
    select: {
      id: true,
      providerWebhookEventId: true,
      providerEventId: true,
      eventType: true,
      processed: true,
    },
  })

  if (!webhook) return actionFailure("NOT_FOUND", "Payment webhook event not found.")

  if (webhook.processed) {
    return actionSuccess({
      providerWebhookEventId: webhook.providerWebhookEventId ?? webhook.id,
      paymentWebhookEventId: webhook.id,
      providerEventId: webhook.providerEventId,
      eventType: webhook.eventType,
      processed: true,
    })
  }

  const processed = await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentWebhookEvent.update({
      where: { id: webhook.id },
      data: {
        processed: true,
        processedAt: new Date(),
        processingError: null,
      },
      select: {
        id: true,
        providerWebhookEventId: true,
        providerEventId: true,
        eventType: true,
        processed: true,
      },
    })

    if (webhook.providerWebhookEventId) {
      await tx.providerWebhookEvent.update({
        where: { id: webhook.providerWebhookEventId },
        data: {
          status: "processed",
          processed: true,
          processedAt: new Date(),
          processingError: null,
        },
      })
    }

    await tx.auditEvent.create({
      data: {
        eventName: "payment.webhook_processed",
        actorType: "system",
        entityType: "PaymentWebhookEvent",
        entityId: payment.id,
        participantSafe: false,
        metadata: {
          provider_event_id: payment.providerEventId,
          event_type: payment.eventType,
        },
      },
    })

    return payment
  })

  revalidatePath("/admin")
  revalidatePath("/admin/payments")

  return actionSuccess({
    providerWebhookEventId: processed.providerWebhookEventId ?? processed.id,
    paymentWebhookEventId: processed.id,
    providerEventId: processed.providerEventId,
    eventType: processed.eventType,
    processed: processed.processed,
  })
}

export async function reconcilePaymentStatus(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const parsed = initializeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment reconciliation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const record = await prisma.paymentRecord.findUnique({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  if (!record) return actionFailure("NOT_FOUND", "Payment record not found.")

  await prisma.auditEvent.create({
    data: {
      eventName: "payment.reconciliation_requested",
      actorType: "admin",
      actorUserId: user.id,
      entityType: "PaymentRecord",
      entityId: record.id,
      participantSafe: false,
      metadata: {
        vouch_id: record.vouchId,
      },
    },
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: record.vouchId,
    paymentRecordId: record.id,
  })

  return actionSuccess(paymentResult(record))
}

export async function reconcileRefundStatus(
  input: unknown
): Promise<ActionResult<RefundActionResult>> {
  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const parsed = initializeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the refund reconciliation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const record = await prisma.refundRecord.findUnique({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  if (!record) return actionFailure("NOT_FOUND", "Refund record not found.")

  await prisma.auditEvent.create({
    data: {
      eventName: "payment.refund_reconciliation_requested",
      actorType: "admin",
      actorUserId: user.id,
      entityType: "RefundRecord",
      entityId: record.id,
      participantSafe: false,
      metadata: {
        vouch_id: record.vouchId,
      },
    },
  })

  await revalidatePaymentSurfaces({ userId: user.id, vouchId: record.vouchId })

  return actionSuccess(refundResult(record))
}

export async function markPaymentFailed(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const parsed = paymentFailureInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment failure fields.",
      getFieldErrors(parsed.error)
    )
  }

  if (!parsed.data.vouchId && !parsed.data.paymentRecordId) {
    return actionFailure("VALIDATION_FAILED", "Payment failure requires a Vouch or payment record.")
  }

  // Replace the existing `existing = ...` block in markPaymentFailed with this:
  let existing: { id: string; vouchId: string } | null = null

  if (parsed.data.paymentRecordId) {
    existing = await prisma.paymentRecord.findUnique({
      where: { id: parsed.data.paymentRecordId },
      select: { id: true, vouchId: true },
    })
  } else if (parsed.data.vouchId) {
    existing = await prisma.paymentRecord.findUnique({
      where: { vouchId: parsed.data.vouchId },
      select: { id: true, vouchId: true },
    })
  }

  if (!existing) return actionFailure("NOT_FOUND", "Payment record not found.")

  const failed = await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.update({
      where: { id: existing.id },
      data: {
        status: "failed",
        ...(parsed.data.failureCode ? { lastErrorCode: parsed.data.failureCode } : {}),
      },
      select: {
        id: true,
        vouchId: true,
        status: true,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.failed",
        actorType: "system",
        entityType: "PaymentRecord",
        entityId: payment.id,
        participantSafe: true,
        metadata: {
          vouch_id: payment.vouchId,
          failure_stage: parsed.data.failureStage,
          ...(parsed.data.failureCode ? { failure_code: parsed.data.failureCode } : {}),
          ...(parsed.data.safeMessage ? { safe_message: parsed.data.safeMessage } : {}),
        },
      },
    })

    return payment
  })

  await revalidatePaymentSurfaces({
    vouchId: failed.vouchId,
    paymentRecordId: failed.id,
  })

  return actionSuccess(paymentResult(failed))
}
