"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type Stripe from "stripe"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import { getAggregateConfirmationStatusTx } from "@/lib/db/transactions/confirmationTransactions"
import {
  createRefundRecordTx,
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
  updatePaymentProviderStateTx,
  upsertPaymentRecordTx,
} from "@/lib/db/transactions/paymentTransactions"
import {
  markVouchAuthorizedTx,
  markVouchCompletedTx,
  markVouchExpiredTx,
} from "@/lib/db/transactions/vouchTransactions"
import {
  createStripeConnectAccount,
  createStripeConnectDashboardLink,
  createStripeConnectOnboardingLink,
  refreshStripeConnectReadiness,
} from "@/lib/integrations/stripe/connect"
import {
  createStripeCustomer,
  createStripeSetupIntent,
  getStripeCustomerPaymentReadiness,
  retrieveStripeSetupIntent,
  setStripeCustomerDefaultPaymentMethod,
} from "@/lib/integrations/stripe/customers"
import {
  cancelStripeAuthorization,
  captureStripePayment,
  createStripePaymentAuthorization,
  refundStripePayment,
  retrieveStripePaymentIntent,
} from "@/lib/integrations/stripe/payment-intents"
import {
  getPaymentIntentCaptureBefore,
  getPaymentIntentLatestChargeId,
  isPaymentIntentCapturable,
  mapStripePaymentIntentSettlementStatus,
  mapStripePaymentIntentStatus,
  mapStripeRefundStatus,
} from "@/lib/integrations/stripe/status-map"
import {
  isStripeAccountEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
  isStripeSetupIntentEvent,
  type StripeWebhookEvent,
} from "@/lib/integrations/stripe/webhook-events"
import {
  authorizeVouchPaymentInputSchema,
  cancelUnconfirmedVouchPaymentInputSchema,
  captureConfirmedVouchPaymentInputSchema,
  paymentProviderReturnInputSchema,
  refundCapturedVouchPaymentInputSchema,
  startStripeConnectInputSchema,
  startStripePaymentManagementInputSchema,
} from "@/schemas/payment"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

type ProviderRedirectResult = {
  redirectTo: string
  clientSecret?: string | null
}

type ReadinessResult = {
  userId: string
  readiness: "not_started" | "requires_action" | "ready" | "restricted" | "failed"
}

type PaymentActionResult = {
  paymentRecordId: string
  vouchId: string
  status: string
  settlementStatus: string
}

type WebhookProcessResult = {
  providerWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
  duplicate?: boolean
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
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
}): Promise<void> {
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")

  if (input.vouchId) {
    revalidatePath(`/vouches/${input.vouchId}`)
  }
}

function mapIntentTiming(intent: Stripe.PaymentIntent) {
  const status = mapStripePaymentIntentStatus(intent.status)
  const settlementStatus = mapStripePaymentIntentSettlementStatus(intent.status)
  const now = new Date()

  return {
    status,
    settlementStatus,
    amountCapturableCents: intent.amount_capturable,
    captureBefore: getPaymentIntentCaptureBefore(intent),
    authorizedAt: intent.status === "requires_capture" ? now : null,
    capturedAt: intent.status === "succeeded" ? now : null,
    canceledAt: intent.status === "canceled" ? now : null,
    failedAt: status === "failed" ? now : null,
  }
}

export async function startStripePaymentManagement(
  input?: unknown
): Promise<ActionResult<ProviderRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = startStripePaymentManagementInputSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the payment setup fields.")
  }

  const existing = await prisma.paymentCustomer.findUnique({
    where: { userId: user.id },
    select: { providerCustomerId: true },
  })

  const providerCustomerId =
    existing?.providerCustomerId ??
    (
      await createStripeCustomer({
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        idempotencyKey: `user:${user.id}:stripe_customer`,
      })
    ).providerCustomerId

  const setupIntent = await createStripeSetupIntent({
    providerCustomerId,
    userId: user.id,
    idempotencyKey: `user:${user.id}:setup_intent`,
  })

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        providerCustomerId,
        readiness: "requires_action",
        lastProviderSyncAt: new Date(),
      },
      update: {
        providerCustomerId,
        readiness: "requires_action",
        lastProviderSyncAt: new Date(),
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.customer_setup_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "PaymentCustomer",
        entityId: user.id,
        participantSafe: false,
        metadata: { provider: "stripe" },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })

  return actionSuccess({
    redirectTo: normalizeInternalReturnTo(parsed.data.returnTo, "/dashboard"),
    clientSecret: setupIntent.clientSecret,
  })
}

export async function handlePaymentMethodSetupReturn(
  input: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = paymentProviderReturnInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the payment provider return fields.")
  }

  if (parsed.data.provider !== "stripe") {
    return actionFailure("UNSUPPORTED_PROVIDER", "Unsupported payment provider.")
  }

  if (!parsed.data.setupSessionId) {
    return actionFailure("PROVIDER_REFERENCE_REQUIRED", "Stripe setup reference is required.")
  }

  const setupIntent = await retrieveStripeSetupIntent({ setupIntentId: parsed.data.setupSessionId })

  if (setupIntent.providerCustomerId && setupIntent.providerPaymentMethodId) {
    await setStripeCustomerDefaultPaymentMethod({
      providerCustomerId: setupIntent.providerCustomerId,
      providerPaymentMethodId: setupIntent.providerPaymentMethodId,
    })
  }

  const readiness =
    setupIntent.providerCustomerId && setupIntent.status === "succeeded"
      ? (await getStripeCustomerPaymentReadiness(setupIntent.providerCustomerId)).readiness
      : "requires_action"

  await prisma.$transaction(async (tx) => {
    if (setupIntent.providerCustomerId) {
      await tx.paymentCustomer.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          providerCustomerId: setupIntent.providerCustomerId,
          readiness,
          lastProviderSyncAt: new Date(),
        },
        update: {
          providerCustomerId: setupIntent.providerCustomerId,
          readiness,
          lastProviderSyncAt: new Date(),
        },
      })
    }

    await tx.auditEvent.create({
      data: {
        eventName: "payment.customer_setup_reconciled",
        actorType: "user",
        actorUserId: user.id,
        entityType: "PaymentCustomer",
        entityId: user.id,
        participantSafe: false,
        metadata: { provider: "stripe", setup_intent_status: setupIntent.status },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })
  return actionSuccess({ userId: user.id, readiness })
}

export async function startStripeConnectOnboarding(
  input?: unknown
): Promise<ActionResult<ProviderRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = startStripeConnectInputSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the Connect onboarding fields.")
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
        idempotencyKey: `user:${user.id}:connect_account`,
      })
    ).providerAccountId

  const appUrl = getAppUrl()
  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/dashboard")
  const link = await createStripeConnectOnboardingLink({
    providerAccountId,
    refreshUrl: `${appUrl}/dashboard`,
    returnUrl: `${appUrl}/dashboard?stripe_connect_return=1&returnTo=${encodeURIComponent(returnTo)}`,
  })

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        providerAccountId,
        readiness: "requires_action",
        lastProviderSyncAt: new Date(),
      },
      update: {
        providerAccountId,
        readiness: "requires_action",
        lastProviderSyncAt: new Date(),
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.connect_onboarding_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "ConnectedAccount",
        entityId: user.id,
        participantSafe: false,
        metadata: { provider: "stripe" },
      },
    })
  })

  await revalidatePaymentSurfaces({ userId: user.id })
  redirect(link.url)
}

export async function openStripeConnectDashboard(): Promise<never> {
  const user = await requireActiveUser()
  const connectedAccount = await prisma.connectedAccount.findUnique({
    where: { userId: user.id },
    select: { providerAccountId: true },
  })

  if (!connectedAccount?.providerAccountId) {
    await startStripeConnectOnboarding()
    redirect("/dashboard")
  }

  const link = await createStripeConnectDashboardLink({
    providerAccountId: connectedAccount.providerAccountId,
  })

  redirect(link.url)
}

export async function refreshPayoutReadiness(
  input?: unknown
): Promise<ActionResult<ReadinessResult>> {
  const user = await requireActiveUser()
  const targetUserId =
    typeof input === "object" && input && "userId" in input ? String(input.userId) : user.id

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
      lastProviderSyncAt: new Date(),
    },
  })

  await revalidatePaymentSurfaces({ userId: targetUserId })
  return actionSuccess({ userId: targetUserId, readiness: readiness.readiness })
}

export async function authorizeVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const parsed = authorizeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the payment authorization fields.")
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      merchantId: true,
      customerId: true,
      currency: true,
      protectedAmountCents: true,
      merchantReceivesCents: true,
      vouchServiceFeeCents: true,
      processingFeeOffsetCents: true,
      applicationFeeAmountCents: true,
      customerTotalCents: true,
      merchant: {
        select: {
          connectedAccount: {
            select: { providerAccountId: true, readiness: true, chargesEnabled: true },
          },
        },
      },
      customer: {
        select: {
          paymentCustomer: {
            select: { providerCustomerId: true, readiness: true },
          },
        },
      },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (!vouch.customerId) return actionFailure("CUSTOMER_REQUIRED", "Customer is required.")
  if (!vouch.customer?.paymentCustomer?.providerCustomerId) {
    return actionFailure("PAYMENT_CUSTOMER_REQUIRED", "Customer payment setup is required.")
  }
  if (!vouch.merchant.connectedAccount?.providerAccountId) {
    return actionFailure("CONNECTED_ACCOUNT_REQUIRED", "Merchant connected account is required.")
  }

  const intent = await createStripePaymentAuthorization({
    vouchId: vouch.id,
    customerTotalCents: vouch.customerTotalCents,
    currency: vouch.currency,
    applicationFeeAmountCents: vouch.applicationFeeAmountCents,
    protectedAmountCents: vouch.protectedAmountCents,
    merchantReceivesCents: vouch.merchantReceivesCents,
    vouchServiceFeeCents: vouch.vouchServiceFeeCents,
    processingFeeOffsetCents: vouch.processingFeeOffsetCents,
    providerCustomerId: vouch.customer.paymentCustomer.providerCustomerId,
    connectedAccountId: vouch.merchant.connectedAccount.providerAccountId,
    confirmOffSession: true,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${vouch.id}:authorize`,
  })

  const timing = mapIntentTiming(intent)

  const paymentRecord = await prisma.$transaction(async (tx) => {
    const record = await upsertPaymentRecordTx(tx, {
      vouchId: vouch.id,
      providerPaymentIntentId: intent.id,
      providerChargeId: getPaymentIntentLatestChargeId(intent),
      status: timing.status,
      settlementStatus: timing.settlementStatus,
      amountCents: vouch.customerTotalCents,
      currency: vouch.currency,
      protectedAmountCents: vouch.protectedAmountCents,
      merchantReceivesCents: vouch.merchantReceivesCents,
      vouchServiceFeeCents: vouch.vouchServiceFeeCents,
      processingFeeOffsetCents: vouch.processingFeeOffsetCents,
      applicationFeeAmountCents: vouch.applicationFeeAmountCents,
      customerTotalCents: vouch.customerTotalCents,
      amountCapturableCents: timing.amountCapturableCents,
      captureBefore: timing.captureBefore,
      authorizedAt: timing.authorizedAt,
      capturedAt: timing.capturedAt,
      canceledAt: timing.canceledAt,
      failedAt: timing.failedAt,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.authorized",
        actorType: "stripe",
        entityType: "PaymentRecord",
        entityId: record.id,
        participantSafe: true,
        metadata: {
          provider_payment_intent_id: intent.id,
          stripe_status: intent.status,
        },
      },
    })

    if (intent.status === "requires_capture") {
      await markVouchAuthorizedTx(tx, { vouchId: vouch.id })
    }

    return record
  })

  await revalidatePaymentSurfaces({ vouchId: vouch.id })
  return actionSuccess({
    paymentRecordId: paymentRecord.id,
    vouchId: paymentRecord.vouchId,
    status: paymentRecord.status,
    settlementStatus: paymentRecord.settlementStatus,
  })
}

export async function captureConfirmedVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const parsed = captureConfirmedVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the capture fields.")
  }

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouchId: true,
      providerPaymentIntentId: true,
      status: true,
      settlementStatus: true,
      vouch: {
        select: {
          id: true,
          merchantId: true,
          customerId: true,
          status: true,
          presenceConfirmations: {
            select: { participantRole: true, status: true },
          },
        },
      },
    },
  })

  if (!paymentRecord?.providerPaymentIntentId) {
    return actionFailure("PAYMENT_RECORD_NOT_FOUND", "Payment record is missing.")
  }

  const aggregate = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: paymentRecord.vouchId })
  )

  if (aggregate !== "both_confirmed") {
    return actionFailure(
      "CONFIRMATION_INCOMPLETE",
      "Both participants must confirm before capture."
    )
  }

  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
  })

  if (!isPaymentIntentCapturable(current)) {
    const timing = mapIntentTiming(current)

    const updated = await prisma.$transaction((tx) =>
      updatePaymentProviderStateTx(tx, {
        paymentRecordId: paymentRecord.id,
        providerPaymentIntentId: current.id,
        providerChargeId: getPaymentIntentLatestChargeId(current),
        status: timing.status,
        settlementStatus: timing.settlementStatus,
        amountCapturableCents: timing.amountCapturableCents,
        captureBefore: timing.captureBefore,
        authorizedAt: timing.authorizedAt,
        capturedAt: timing.capturedAt,
        canceledAt: timing.canceledAt,
        failedAt: timing.failedAt,
      })
    )

    return actionFailure(
      "PAYMENT_NOT_CAPTURABLE",
      `PaymentIntent is not capturable. Stripe status: ${current.status}.`,
      { paymentRecordId: [updated.id] }
    )
  }

  const captured = await captureStripePayment({
    providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${paymentRecord.vouchId}:capture`,
  })

  const timing = mapIntentTiming(captured)

  const updated = await prisma.$transaction(async (tx) => {
    const record = await updatePaymentProviderStateTx(tx, {
      paymentRecordId: paymentRecord.id,
      providerPaymentIntentId: captured.id,
      providerChargeId: getPaymentIntentLatestChargeId(captured),
      status: timing.status,
      settlementStatus: timing.settlementStatus,
      amountCapturableCents: timing.amountCapturableCents,
      captureBefore: timing.captureBefore,
      authorizedAt: timing.authorizedAt,
      capturedAt: timing.capturedAt,
      canceledAt: timing.canceledAt,
      failedAt: timing.failedAt,
    })

    if (captured.status === "succeeded") {
      await markVouchCompletedTx(tx, { vouchId: paymentRecord.vouchId })
    }

    await tx.auditEvent.create({
      data: {
        eventName: "payment.captured",
        actorType: "stripe",
        entityType: "PaymentRecord",
        entityId: paymentRecord.id,
        participantSafe: true,
        metadata: { stripe_status: captured.status },
      },
    })

    return record
  })

  await revalidatePaymentSurfaces({ vouchId: paymentRecord.vouchId })
  return actionSuccess({
    paymentRecordId: updated.id,
    vouchId: updated.vouchId,
    status: updated.status,
    settlementStatus: updated.settlementStatus,
  })
}

export async function cancelUnconfirmedVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const parsed = cancelUnconfirmedVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the cancel fields.")
  }

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouchId: true,
      providerPaymentIntentId: true,
    },
  })

  if (!paymentRecord?.providerPaymentIntentId) {
    return actionFailure("PAYMENT_RECORD_NOT_FOUND", "Payment record is missing.")
  }

  const canceled = await cancelStripeAuthorization({
    providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${paymentRecord.vouchId}:cancel`,
  })

  const timing = mapIntentTiming(canceled)

  const updated = await prisma.$transaction(async (tx) => {
    const record = await updatePaymentProviderStateTx(tx, {
      paymentRecordId: paymentRecord.id,
      providerPaymentIntentId: canceled.id,
      providerChargeId: getPaymentIntentLatestChargeId(canceled),
      status: timing.status,
      settlementStatus: "non_captured",
      amountCapturableCents: timing.amountCapturableCents,
      captureBefore: timing.captureBefore,
      canceledAt: timing.canceledAt ?? new Date(),
    })

    await markVouchExpiredTx(tx, { vouchId: paymentRecord.vouchId })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.non_captured",
        actorType: "stripe",
        entityType: "PaymentRecord",
        entityId: paymentRecord.id,
        participantSafe: true,
        metadata: { stripe_status: canceled.status },
      },
    })

    return record
  })

  await revalidatePaymentSurfaces({ vouchId: paymentRecord.vouchId })
  return actionSuccess({
    paymentRecordId: updated.id,
    vouchId: updated.vouchId,
    status: updated.status,
    settlementStatus: updated.settlementStatus,
  })
}

export async function refundCapturedVouchPayment(
  input: unknown
): Promise<ActionResult<{ refundRecordId: string; vouchId: string; status: string }>> {
  const parsed = refundCapturedVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the refund fields.")
  }

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouchId: true,
      providerPaymentIntentId: true,
      amountCents: true,
    },
  })

  if (!paymentRecord?.providerPaymentIntentId) {
    return actionFailure("PAYMENT_RECORD_NOT_FOUND", "Payment record is missing.")
  }

  const refund = await refundStripePayment({
    providerPaymentIntentId: paymentRecord.providerPaymentIntentId,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${paymentRecord.vouchId}:refund`,
  })

  const record = await prisma.$transaction(async (tx) => {
    await updatePaymentProviderStateTx(tx, {
      paymentRecordId: paymentRecord.id,
      status: "captured",
      settlementStatus: "refund_pending",
    })

    const refundRecord = await createRefundRecordTx(tx, {
      vouchId: paymentRecord.vouchId,
      paymentRecordId: paymentRecord.id,
      providerRefundId: refund.id,
      status: mapStripeRefundStatus(refund.status),
      reason: "captured_reversal_required",
      amountCents: refund.amount ?? paymentRecord.amountCents,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.refund_created",
        actorType: "stripe",
        entityType: "RefundRecord",
        entityId: refundRecord.id,
        participantSafe: true,
        metadata: { stripe_status: refund.status },
      },
    })

    return refundRecord
  })

  await revalidatePaymentSurfaces({ vouchId: paymentRecord.vouchId })
  return actionSuccess({
    refundRecordId: record.id,
    vouchId: record.vouchId,
    status: record.status,
  })
}

export async function processStripeWebhookEvent(
  event: StripeWebhookEvent
): Promise<ActionResult<WebhookProcessResult>> {
  const ledger = await prisma.$transaction((tx) =>
    recordProviderWebhookReceivedTx(tx, {
      providerEventId: event.id,
      eventType: event.type,
      safeMetadata: { livemode: "livemode" in event ? event.livemode : undefined },
    })
  )

  if (ledger.duplicate) {
    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: false,
      duplicate: true,
    })
  }

  try {
    if (isStripePaymentIntentEvent(event)) {
      await reconcileStripePaymentIntentEvent(ledger.event.id, event)
    } else if (isStripeRefundEvent(event)) {
      await reconcileStripeRefundEvent(ledger.event.id, event)
    } else if (isStripeSetupIntentEvent(event)) {
      await reconcileStripeSetupIntentEvent(ledger.event.id, event)
    } else if (isStripeAccountEvent(event)) {
      await reconcileStripeAccountEvent(ledger.event.id, event)
    } else {
      await prisma.$transaction((tx) => markProviderWebhookIgnoredTx(tx, { id: ledger.event.id }))
    }

    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: true,
    })
  } catch (error) {
    await prisma.$transaction((tx) =>
      markProviderWebhookFailedTx(tx, {
        id: ledger.event.id,
        error: error instanceof Error ? error.message : String(error),
      })
    )

    return actionFailure("WEBHOOK_PROCESSING_FAILED", "Stripe webhook processing failed.")
  }
}

export async function recordProviderWebhookReceived(input: {
  provider: "clerk" | "stripe" | "stripe_identity"
  providerEventId: string
  eventType: string
  safeMetadata?: Record<string, unknown>
}) {
  const eventInput: Parameters<typeof recordProviderWebhookReceivedTx>[1] = {
    provider: input.provider,
    providerEventId: input.providerEventId,
    eventType: input.eventType,
  }
  if (input.safeMetadata !== undefined) eventInput.safeMetadata = input.safeMetadata

  return prisma.$transaction((tx) =>
    recordProviderWebhookReceivedTx(tx, eventInput)
  )
}

export async function markProviderWebhookProcessed(id: string) {
  return prisma.$transaction((tx) => markProviderWebhookProcessedTx(tx, { id }))
}

export async function markProviderWebhookIgnored(id: string, _reason?: string) {
  return prisma.$transaction((tx) => markProviderWebhookIgnoredTx(tx, { id }))
}

export async function markProviderWebhookFailed(id: string, error: string) {
  return prisma.$transaction((tx) => markProviderWebhookFailedTx(tx, { id, error }))
}

async function reconcileStripePaymentIntentEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const intent = event.data.object as Stripe.PaymentIntent
  const current = await retrieveStripePaymentIntent({ providerPaymentIntentId: intent.id })
  const timing = mapIntentTiming(current)

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { providerPaymentIntentId: current.id },
    select: { id: true, vouchId: true },
  })

  if (!paymentRecord) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    await updatePaymentProviderStateTx(tx, {
      paymentRecordId: paymentRecord.id,
      providerPaymentIntentId: current.id,
      providerChargeId: getPaymentIntentLatestChargeId(current),
      status: timing.status,
      settlementStatus: timing.settlementStatus,
      amountCapturableCents: timing.amountCapturableCents,
      captureBefore: timing.captureBefore,
      authorizedAt: timing.authorizedAt,
      capturedAt: timing.capturedAt,
      canceledAt: timing.canceledAt,
      failedAt: timing.failedAt,
    })

    await tx.paymentWebhookEvent.create({
      data: {
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: { payment_intent_status: current.status },
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })

  await revalidatePaymentSurfaces({ vouchId: paymentRecord.vouchId })
}

async function reconcileStripeRefundEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const refund = event.data.object as Stripe.Refund
  const status = mapStripeRefundStatus(refund.status)

  const refundRecord = await prisma.refundRecord.findUnique({
    where: { providerRefundId: refund.id },
    select: { id: true, vouchId: true, paymentRecordId: true },
  })

  if (!refundRecord) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.refundRecord.update({
      where: { id: refundRecord.id },
      data: { status },
    })

    if (status === "succeeded") {
      await tx.paymentRecord.update({
        where: { id: refundRecord.paymentRecordId },
        data: { settlementStatus: "refunded" },
      })
    }

    await tx.paymentWebhookEvent.create({
      data: {
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: refundRecord.vouchId,
        refundRecordId: refundRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: { refund_status: refund.status },
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })

  await revalidatePaymentSurfaces({ vouchId: refundRecord.vouchId })
}

async function reconcileStripeSetupIntentEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const setupIntent = event.data.object as Stripe.SetupIntent
  const customerId =
    typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id

  if (!customerId) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  const readiness = await getStripeCustomerPaymentReadiness(customerId)

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.updateMany({
      where: { providerCustomerId: customerId },
      data: {
        readiness: readiness.readiness,
        lastProviderSyncAt: new Date(),
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}

async function reconcileStripeAccountEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const account = event.data.object as Stripe.Account
  const readiness = await refreshStripeConnectReadiness({ providerAccountId: account.id })

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.updateMany({
      where: { providerAccountId: account.id },
      data: {
        readiness: readiness.readiness,
        chargesEnabled: readiness.chargesEnabled,
        payoutsEnabled: readiness.payoutsEnabled,
        detailsSubmitted: readiness.detailsSubmitted,
        lastProviderSyncAt: new Date(),
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}

/**
 * Compatibility aliases retained temporarily.
 */
export const startPaymentMethodSetup = startStripePaymentManagement
export const startPaymentMethodSetupAction = startStripePaymentManagement
export const startPayoutOnboarding = startStripeConnectOnboarding
export const startPayoutSetupAction = startStripeConnectOnboarding
export const openPayoutDashboard = openStripeConnectDashboard
export const createStripeAccountSessionAction = openStripeConnectDashboard
export const initializeVouchPayment = authorizeVouchPayment
export const initializeStripePaymentForVouch = authorizeVouchPayment
export const releaseStripePaymentForCompletedVouch = captureConfirmedVouchPayment
export const refundOrVoidStripePaymentForVouch = cancelUnconfirmedVouchPayment
export const captureOrReleaseVouchPayment = captureConfirmedVouchPayment
export const refundOrVoidVouchPayment = cancelUnconfirmedVouchPayment
