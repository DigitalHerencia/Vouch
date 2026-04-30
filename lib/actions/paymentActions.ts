"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCapability } from "@/lib/auth/authorization/capabilities"
import { prisma } from "@/lib/db/prisma"
import {
  createStripeConnectAccount,
  createStripeConnectOnboardingLink,
  refreshStripeConnectReadiness,
} from "@/lib/integrations/stripe/connect"
import { getStripeServerClient } from "@/lib/integrations/stripe/client"
import { initializeStripePaymentForVouch } from "@/lib/actions/stripePaymentActions"
import {
  authorizeVouchPaymentInputSchema,
  captureOrReleaseVouchPaymentInputSchema,
  initializeVouchPaymentInputSchema,
  paymentFailureInputSchema,
  paymentReadinessInputSchema,
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
  clientSecret?: string | null
}

type WebhookRecordResult = {
  providerWebhookEventId: string
  paymentWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
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

function normalizeInternalReturnTo(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//")) return fallback
  if (value.includes("://")) return fallback
  return value
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
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

  const stripe = getStripeServerClient()
  const customer = await prisma.paymentCustomer.findUnique({
    where: { userId: user.id },
    select: { providerCustomerId: true },
  })
  const providerCustomerId =
    customer?.providerCustomerId ??
    (
      await stripe.customers.create(
        {
          ...(user.email ? { email: user.email } : {}),
          ...(user.displayName ? { name: user.displayName } : {}),
          metadata: { vouch_user_id: user.id },
        },
        { idempotencyKey: `user:${user.id}:stripe_customer` }
      )
    ).id
  const setupIntent = await stripe.setupIntents.create(
    {
      customer: providerCustomerId,
      usage: "off_session",
      metadata: { vouch_user_id: user.id },
    },
    { idempotencyKey: `user:${user.id}:setup_intent` }
  )

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.upsert({
      where: { userId: user.id },
      create: { userId: user.id, providerCustomerId },
      update: { providerCustomerId },
    })
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
  return actionSuccess({
    redirectTo: `/settings/payment?returnTo=${encodeURIComponent(returnTo)}`,
    clientSecret: setupIntent.client_secret ?? null,
  })
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

  const setupIntentId = parsed.data.setupSessionId
  if (!setupIntentId) {
    return actionFailure("PROVIDER_REFERENCE_REQUIRED", "Stripe setup reference is required.")
  }

  const setupIntent = await getStripeServerClient().setupIntents.retrieve(setupIntentId)
  const readiness = setupIntent.status === "succeeded" ? "ready" : "requires_action"

  if (setupIntent.customer && typeof setupIntent.customer === "string") {
    if (setupIntent.payment_method && typeof setupIntent.payment_method === "string") {
      await getStripeServerClient().customers.update(setupIntent.customer, {
        invoice_settings: { default_payment_method: setupIntent.payment_method },
      })
    }

    await prisma.paymentCustomer.upsert({
      where: { userId: user.id },
      create: { userId: user.id, providerCustomerId: setupIntent.customer },
      update: { providerCustomerId: setupIntent.customer },
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        paymentReadiness: readiness,
      },
      update: {
        paymentReadiness: readiness,
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
    readiness,
  })
}

export async function refreshPaymentReadiness(
  input?: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentReadinessInputSchema.safeParse(input ?? {})

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

  const customer = await prisma.paymentCustomer.findUnique({
    where: { userId: targetUserId },
    select: { providerCustomerId: true },
  })
  const readiness = customer ? "ready" : "not_started"
  const profile = await prisma.verificationProfile.upsert({
    where: { userId: targetUserId },
    create: { userId: targetUserId, paymentReadiness: readiness },
    update: { paymentReadiness: readiness },
    select: { paymentReadiness: true },
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

  const existing = await prisma.connectedAccount.findUnique({
    where: { userId: user.id },
    select: { providerAccountId: true },
  })
  const providerAccountId =
    existing?.providerAccountId ??
    (
      await createStripeConnectAccount({
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
      })
    ).providerAccountId
  const appUrl = getAppUrl()
  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/payout")
  const link = await createStripeConnectOnboardingLink({
    providerAccountId,
    refreshUrl: `${appUrl}/settings/payout?returnTo=${encodeURIComponent(returnTo)}`,
    returnUrl: `${appUrl}/settings/payout?provider=stripe&setupSessionId=${encodeURIComponent(providerAccountId)}&returnTo=${encodeURIComponent(returnTo)}`,
  })

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.upsert({
      where: { userId: user.id },
      create: { userId: user.id, providerAccountId, readiness: "requires_action" },
      update: { providerAccountId, readiness: "requires_action" },
    })
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

  redirect(link.url)
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

  const accountId = parsed.data.setupSessionId
  if (!accountId) {
    return actionFailure("PROVIDER_REFERENCE_REQUIRED", "Stripe account reference is required.")
  }
  const readiness = await refreshStripeConnectReadiness({ providerAccountId: accountId })

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        providerAccountId: accountId,
        readiness: readiness.readiness,
        chargesEnabled: readiness.chargesEnabled,
        payoutsEnabled: readiness.payoutsEnabled,
        detailsSubmitted: readiness.detailsSubmitted,
      },
      update: {
        readiness: readiness.readiness,
        chargesEnabled: readiness.chargesEnabled,
        payoutsEnabled: readiness.payoutsEnabled,
        detailsSubmitted: readiness.detailsSubmitted,
      },
    })
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        payoutReadiness: readiness.readiness,
      },
      update: {
        payoutReadiness: readiness.readiness,
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
    readiness: readiness.readiness,
  })
}

export async function refreshPayoutReadiness(
  input?: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentReadinessInputSchema.safeParse(input ?? {})

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

  const account = await prisma.connectedAccount.findUnique({
    where: { userId: targetUserId },
    select: { providerAccountId: true },
  })
  const readiness = account
    ? await refreshStripeConnectReadiness({ providerAccountId: account.providerAccountId })
    : {
        readiness: "not_started" as const,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      }

  await prisma.connectedAccount.updateMany({
    where: { userId: targetUserId },
    data: {
      readiness: readiness.readiness,
      chargesEnabled: readiness.chargesEnabled,
      payoutsEnabled: readiness.payoutsEnabled,
      detailsSubmitted: readiness.detailsSubmitted,
    },
  })

  const profile = await prisma.verificationProfile.upsert({
    where: { userId: targetUserId },
    create: { userId: targetUserId, payoutReadiness: readiness.readiness },
    update: { payoutReadiness: readiness.readiness },
    select: { payoutReadiness: true },
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
      payee: {
        select: {
          connectedAccount: {
            select: {
              providerAccountId: true,
            },
          },
        },
      },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.payerId !== user.id) return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (!vouch.payee?.connectedAccount?.providerAccountId) {
    return actionFailure("CONNECTED_ACCOUNT_REQUIRED", "Payee payout account is required.")
  }

  const initialized = await initializeStripePaymentForVouch({
    vouchId: vouch.id,
    amountCents: vouch.amountCents,
    currency: vouch.currency,
    platformFeeCents: vouch.platformFeeCents,
    ...(vouch.payer.paymentCustomer?.providerCustomerId
      ? { providerCustomerId: vouch.payer.paymentCustomer.providerCustomerId }
      : {}),
    connectedAccountId: vouch.payee.connectedAccount.providerAccountId,
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
  await requireActiveUser()
  const parsed = captureOrReleaseVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment release fields.",
      getFieldErrors(parsed.error)
    )
  }

  return actionFailure(
    "SYSTEM_ONLY_PAYMENT_RELEASE",
    "Payment release runs only after deterministic confirmation resolution."
  )
}

export async function refundOrVoidVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  await requireActiveUser()
  const parsed = refundOrVoidVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the refund fields.",
      getFieldErrors(parsed.error)
    )
  }

  return actionFailure(
    "SYSTEM_ONLY_REFUND_OR_VOID",
    "Refunds and voids run only through expiration, jobs, or provider webhooks."
  )
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
