"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Prisma } from "@/prisma/generated/prisma/client"
import type Stripe from "stripe"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCapability } from "@/lib/authz/capabilities"
import { prisma } from "@/lib/db/prisma"
import { getAggregateConfirmationStatusTx } from "@/lib/db/transactions/confirmationTransactions"
import {
  createStripeConnectAccount,
  createStripeConnectDashboardLink,
  createStripeConnectOnboardingLink,
  refreshStripeConnectReadiness,
} from "@/lib/integrations/stripe/connect"
import { createStripeCheckoutAuthorization } from "@/lib/integrations/stripe/checkout-sessions"
import { getStripeServerClient } from "@/lib/integrations/stripe/client"
import {
  captureStripePayment,
  createStripePaymentAuthorization,
  refundStripePayment,
  retrieveStripePaymentIntent,
  voidStripeAuthorization,
} from "@/lib/integrations/stripe/payment-intents"
import { calculateVouchPricing, type VouchPricing } from "@/lib/vouch/fees"
import {
  mapStripePaymentIntentStatus,
  mapStripeRefundStatus,
} from "@/lib/integrations/stripe/status-map"
import {
  isStripeAccountEvent,
  isStripeCheckoutSessionEvent,
  isStripeIdentityEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
  isStripeSetupIntentEvent,
} from "@/lib/integrations/stripe/webhook-events"
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
import type { ProviderWebhookLedgerInput } from "@/types/webhooks"

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

function getVouchPricingSnapshot(input: {
  amountCents: number
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
}): VouchPricing {
  if (
    input.protectedAmountCents &&
    input.merchantReceivesCents &&
    input.customerTotalCents &&
    input.applicationFeeAmountCents !== undefined &&
    input.vouchServiceFeeCents !== undefined &&
    input.processingFeeOffsetCents !== undefined
  ) {
    return {
      protectedAmountCents: input.protectedAmountCents,
      merchantReceivesCents: input.merchantReceivesCents,
      vouchServiceFeeCents: input.vouchServiceFeeCents,
      processingFeeOffsetCents: input.processingFeeOffsetCents,
      applicationFeeAmountCents: input.applicationFeeAmountCents,
      customerTotalCents: input.customerTotalCents,
    }
  }

  return calculateVouchPricing({ protectedAmountCents: input.amountCents })
}

async function getStripeCustomerPaymentReadiness(providerCustomerId: string): Promise<{
  readiness: "requires_action" | "ready" | "failed"
  defaultPaymentMethodId: string | null
}> {
  const stripe = getStripeServerClient()
  const customer = await stripe.customers.retrieve(providerCustomerId, {
    expand: ["invoice_settings.default_payment_method"],
  })

  if ("deleted" in customer && customer.deleted) {
    return { readiness: "failed", defaultPaymentMethodId: null }
  }

  const defaultPaymentMethod = customer.invoice_settings.default_payment_method
  const defaultPaymentMethodId =
    typeof defaultPaymentMethod === "string" ? defaultPaymentMethod : defaultPaymentMethod?.id

  if (defaultPaymentMethodId) {
    return { readiness: "ready", defaultPaymentMethodId }
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: providerCustomerId,
    type: "card",
    limit: 1,
  })

  const fallbackPaymentMethodId = paymentMethods.data[0]?.id ?? null

  if (fallbackPaymentMethodId) {
    await stripe.customers.update(providerCustomerId, {
      invoice_settings: { default_payment_method: fallbackPaymentMethodId },
    })
    return { readiness: "ready", defaultPaymentMethodId: fallbackPaymentMethodId }
  }

  return { readiness: "requires_action", defaultPaymentMethodId: null }
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
      protectedAmountCents: true,
      merchantReceivesCents: true,
      vouchServiceFeeCents: true,
      processingFeeOffsetCents: true,
      applicationFeeAmountCents: true,
      customerTotalCents: true,
      providerPaymentId: true,
      vouch: {
        select: {
          id: true,
          payerId: true,
          payeeId: true,
          amountCents: true,
          currency: true,
          platformFeeCents: true,
          protectedAmountCents: true,
          merchantReceivesCents: true,
          vouchServiceFeeCents: true,
          processingFeeOffsetCents: true,
          applicationFeeAmountCents: true,
          customerTotalCents: true,
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
  let readiness: "requires_action" | "ready" | "failed" =
    setupIntent.status === "succeeded" ? "ready" : "requires_action"

  if (setupIntent.customer && typeof setupIntent.customer === "string") {
    if (setupIntent.payment_method && typeof setupIntent.payment_method === "string") {
      await getStripeServerClient().customers.update(setupIntent.customer, {
        invoice_settings: { default_payment_method: setupIntent.payment_method },
      })
    }

    readiness = (await getStripeCustomerPaymentReadiness(setupIntent.customer)).readiness

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
  const readiness = customer
    ? (await getStripeCustomerPaymentReadiness(customer.providerCustomerId)).readiness
    : "not_started"
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
    returnUrl: `${appUrl}/settings/payout/return?provider=stripe&setupSessionId=${encodeURIComponent(providerAccountId)}&returnTo=${encodeURIComponent(returnTo)}`,
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

export async function openPayoutDashboard(): Promise<never> {
  const user = await requireActiveUser()
  const connectedAccount = await prisma.connectedAccount.findUnique({
    where: { userId: user.id },
    select: { providerAccountId: true },
  })

  if (!connectedAccount?.providerAccountId) {
    redirect("/settings/payout")
  }

  const link = await createStripeConnectDashboardLink({
    providerAccountId: connectedAccount.providerAccountId,
  })

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
      payeeId: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      protectedAmountCents: true,
      merchantReceivesCents: true,
      vouchServiceFeeCents: true,
      processingFeeOffsetCents: true,
      applicationFeeAmountCents: true,
      customerTotalCents: true,
      paymentRecord: {
        select: {
          id: true,
          status: true,
        },
      },
      payer: {
        select: {
          connectedAccount: {
            select: {
              providerAccountId: true,
            },
          },
        },
      },
      payee: {
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
  if (vouch.payeeId !== user.id) {
    return actionFailure("AUTHZ_DENIED", "Customer access required.")
  }
  if (!vouch.payer.connectedAccount?.providerAccountId) {
    return actionFailure("CONNECTED_ACCOUNT_REQUIRED", "Merchant payout account is required.")
  }
  if (!vouch.payee?.paymentCustomer?.providerCustomerId) {
    return actionFailure("PAYMENT_CUSTOMER_REQUIRED", "Customer payment setup is required.")
  }

  const initialized = await initializeStripePaymentForVouch({
    vouchId: vouch.id,
    pricing: getVouchPricingSnapshot(vouch),
    currency: vouch.currency,
    providerCustomerId: vouch.payee.paymentCustomer.providerCustomerId,
    connectedAccountId: vouch.payer.connectedAccount.providerAccountId,
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
        protected_amount_cents: getVouchPricingSnapshot(vouch).protectedAmountCents,
        merchant_receives_cents: getVouchPricingSnapshot(vouch).merchantReceivesCents,
        vouch_service_fee_cents: getVouchPricingSnapshot(vouch).vouchServiceFeeCents,
        processing_fee_offset_cents: getVouchPricingSnapshot(vouch).processingFeeOffsetCents,
        customer_total_cents: getVouchPricingSnapshot(vouch).customerTotalCents,
        application_fee_amount_cents: getVouchPricingSnapshot(vouch).applicationFeeAmountCents,
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

export async function startVouchCheckoutSession(
  input: unknown
): Promise<ActionResult<PaymentActionResult & { redirectTo: string }>> {
  const user = await requireActiveUser()
  const parsed = initializeVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment checkout fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      protectedAmountCents: true,
      merchantReceivesCents: true,
      vouchServiceFeeCents: true,
      processingFeeOffsetCents: true,
      applicationFeeAmountCents: true,
      customerTotalCents: true,
      payer: {
        select: {
          connectedAccount: {
            select: {
              providerAccountId: true,
            },
          },
        },
      },
      payee: {
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
  if (vouch.payeeId !== user.id) {
    return actionFailure("AUTHZ_DENIED", "Customer access required.")
  }
  if (!vouch.payer.connectedAccount?.providerAccountId) {
    return actionFailure("CONNECTED_ACCOUNT_REQUIRED", "Merchant payout account is required.")
  }

  const appUrl = getAppUrl()
  const initialized = await initializeStripeCheckoutSessionForVouch({
    vouchId: vouch.id,
    pricing: getVouchPricingSnapshot(vouch),
    currency: vouch.currency,
    ...(vouch.payee?.paymentCustomer?.providerCustomerId
      ? { providerCustomerId: vouch.payee.paymentCustomer.providerCustomerId }
      : {}),
    connectedAccountId: vouch.payer.connectedAccount.providerAccountId,
    successUrl: `${appUrl}/vouches/${vouch.id}?checkout=complete`,
    cancelUrl: `${appUrl}/vouches/${vouch.id}?checkout=cancelled`,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${vouch.id}:checkout_authorization`,
  })

  if (!initialized.ok || !initialized.providerCheckoutSessionId) {
    await markPaymentFailed({
      vouchId: vouch.id,
      failureStage: "create",
      failureCode: initialized.ok ? "STRIPE_CHECKOUT_URL_MISSING" : initialized.code,
      safeMessage: initialized.ok
        ? "Stripe did not return a checkout session reference."
        : initialized.message,
    })

    return actionFailure(
      initialized.ok ? "STRIPE_CHECKOUT_URL_MISSING" : initialized.code,
      initialized.ok ? "Stripe checkout session was not created." : initialized.message
    )
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

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: vouch.id,
    paymentRecordId: record.id,
  })

  return actionSuccess({
    ...paymentResult(record),
    redirectTo: initialized.checkoutUrl ?? `/vouches/${vouch.id}`,
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
  assertCapability(user, "retry_safe_technical_operation")
  const parsed = captureOrReleaseVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment release fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      status: true,
      paymentRecord: { select: { id: true } },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.status !== "active") return actionFailure("INVALID_VOUCH_STATE", "Vouch is not active.")
  if (!vouch.paymentRecord) {
    return actionFailure("PAYMENT_RECORD_NOT_READY", "Payment record is not ready.")
  }
  const paymentRecordId = vouch.paymentRecord.id

  const aggregateStatus = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: vouch.id })
  )

  if (aggregateStatus !== "both_confirmed") {
    return actionFailure("DUAL_CONFIRMATION_REQUIRED", "Both parties must confirm before capture.")
  }

  const release = await releaseStripePaymentForCompletedVouch({
    paymentRecordId,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${vouch.id}:admin_capture_retry`,
  })

  if (!release.ok) return actionFailure(release.code, release.message)

  const record = await prisma.$transaction(async (tx) => {
    await tx.vouch.update({
      where: { id: vouch.id },
      data: { status: "completed", completedAt: new Date() },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payment.capture_retry_completed",
        actorType: "admin",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: false,
      },
    })
    return tx.paymentRecord.findUniqueOrThrow({
      where: { id: paymentRecordId },
      select: { id: true, vouchId: true, status: true },
    })
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: record.vouchId,
    paymentRecordId: record.id,
  })

  return actionSuccess(paymentResult(record))
}

export async function refundOrVoidVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")
  const parsed = refundOrVoidVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the refund fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      status: true,
      confirmationExpiresAt: true,
      paymentRecord: { select: { id: true } },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (!["pending", "active", "failed"].includes(vouch.status)) {
    return actionFailure("INVALID_VOUCH_STATE", "Only unresolved Vouches can be voided/refunded.")
  }
  if (vouch.confirmationExpiresAt > new Date()) {
    return actionFailure("CONFIRMATION_WINDOW_OPEN", "Vouch has not reached expiration.")
  }
  if (!vouch.paymentRecord) {
    return actionFailure("PAYMENT_RECORD_NOT_READY", "Payment record is not ready.")
  }
  const paymentRecordId = vouch.paymentRecord.id

  const aggregateStatus = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: vouch.id })
  )

  if (aggregateStatus === "both_confirmed") {
    return actionFailure(
      "DUAL_CONFIRMATION_SATISFIED",
      "Both confirmations exist; capture resolution is required instead."
    )
  }

  const reversed = await refundOrVoidStripePaymentForVouch({
    paymentRecordId,
    reason: vouch.status === "pending" ? "not_accepted" : "confirmation_incomplete",
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${vouch.id}:admin_refund_or_void_retry`,
  })

  if (!reversed.ok) return actionFailure(reversed.code, reversed.message)

  const record = await prisma.$transaction(async (tx) => {
    await tx.vouch.update({
      where: { id: vouch.id },
      data: { status: "expired", expiredAt: new Date() },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payment.refund_or_void_retry_completed",
        actorType: "admin",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: false,
        metadata: { aggregate_confirmation_status: aggregateStatus },
      },
    })
    return tx.paymentRecord.findUniqueOrThrow({
      where: { id: paymentRecordId },
      select: { id: true, vouchId: true, status: true },
    })
  })

  await revalidatePaymentSurfaces({
    userId: user.id,
    vouchId: record.vouchId,
    paymentRecordId: record.id,
  })

  return actionSuccess(paymentResult(record))
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

export type StripePaymentAdapterResult =
  | {
      ok: true
      providerPaymentId?: string | null
      providerCheckoutSessionId?: string | null
      checkoutUrl?: string | null
      clientSecret?: string | null
    }
  | { ok: false; code: string; message: string }

export type InitializeStripePaymentInput = {
  vouchId: string
  pricing: VouchPricing
  currency: string
  providerCustomerId?: string
  providerPaymentMethodId?: string
  connectedAccountId?: string
  confirmOffSession?: boolean
  idempotencyKey?: string
}

function getCheckoutSessionPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id
}

export async function initializeStripeCheckoutSessionForVouch(
  input: Omit<
    InitializeStripePaymentInput,
    "providerPaymentMethodId" | "confirmOffSession" | "connectedAccountId"
  > & {
    connectedAccountId: string
    successUrl: string
    cancelUrl?: string
  }
): Promise<StripePaymentAdapterResult> {
  const existing = await prisma.paymentRecord.findUnique({
    where: { vouchId: input.vouchId },
    select: {
      id: true,
      status: true,
    },
  })

  if (
    existing &&
    existing.status !== "not_started" &&
    existing.status !== "requires_payment_method"
  ) {
    return {
      ok: false,
      code: "PAYMENT_ALREADY_IN_PROGRESS",
      message: "Payment already has provider state.",
    }
  }

  try {
    const session = await createStripeCheckoutAuthorization({
      vouchId: input.vouchId,
      pricing: input.pricing,
      currency: input.currency,
      connectedAccountId: input.connectedAccountId,
      ...(input.providerCustomerId ? { providerCustomerId: input.providerCustomerId } : {}),
      successUrl: input.successUrl,
      ...(input.cancelUrl ? { cancelUrl: input.cancelUrl } : {}),
      idempotencyKey: input.idempotencyKey ?? `vouch:${input.vouchId}:checkout_authorization`,
    })
    const providerPaymentId = getCheckoutSessionPaymentIntentId(session)

    await prisma.paymentRecord.upsert({
      where: { vouchId: input.vouchId },
      create: {
        vouchId: input.vouchId,
        provider: "stripe",
        providerPaymentId,
        providerCheckoutSessionId: session.id,
        status: "requires_payment_method",
        amountCents: input.pricing.protectedAmountCents,
        currency: input.currency,
        platformFeeCents: input.pricing.vouchServiceFeeCents,
        protectedAmountCents: input.pricing.protectedAmountCents,
        merchantReceivesCents: input.pricing.merchantReceivesCents,
        vouchServiceFeeCents: input.pricing.vouchServiceFeeCents,
        processingFeeOffsetCents: input.pricing.processingFeeOffsetCents,
        applicationFeeAmountCents: input.pricing.applicationFeeAmountCents,
        customerTotalCents: input.pricing.customerTotalCents,
      },
      update: {
        providerPaymentId,
        providerCheckoutSessionId: session.id,
        status: "requires_payment_method",
        amountCents: input.pricing.protectedAmountCents,
        currency: input.currency,
        platformFeeCents: input.pricing.vouchServiceFeeCents,
        protectedAmountCents: input.pricing.protectedAmountCents,
        merchantReceivesCents: input.pricing.merchantReceivesCents,
        vouchServiceFeeCents: input.pricing.vouchServiceFeeCents,
        processingFeeOffsetCents: input.pricing.processingFeeOffsetCents,
        applicationFeeAmountCents: input.pricing.applicationFeeAmountCents,
        customerTotalCents: input.pricing.customerTotalCents,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    })

    return {
      ok: true,
      providerPaymentId,
      providerCheckoutSessionId: session.id,
      checkoutUrl: session.url,
      clientSecret: session.client_secret,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe checkout initialization failed."
    return { ok: false, code: "STRIPE_CHECKOUT_INITIALIZATION_FAILED", message }
  }
}

export async function initializeStripePaymentForVouch(
  input: InitializeStripePaymentInput
): Promise<StripePaymentAdapterResult> {
  const existing = await prisma.paymentRecord.findUnique({
    where: { vouchId: input.vouchId },
    select: { id: true, providerPaymentId: true, status: true },
  })

  if (existing?.providerPaymentId && existing.status === "authorized") {
    return { ok: true, providerPaymentId: existing.providerPaymentId, clientSecret: null }
  }

  if (
    existing &&
    existing.status !== "not_started" &&
    existing.status !== "requires_payment_method"
  ) {
    return {
      ok: false,
      code: "PAYMENT_ALREADY_IN_PROGRESS",
      message: "Payment already has provider state.",
    }
  }

  try {
    const paymentIntent = await createStripePaymentAuthorization({
      vouchId: input.vouchId,
      customerTotalCents: input.pricing.customerTotalCents,
      currency: input.currency,
      applicationFeeAmountCents: input.pricing.applicationFeeAmountCents,
      protectedAmountCents: input.pricing.protectedAmountCents,
      merchantReceivesCents: input.pricing.merchantReceivesCents,
      vouchServiceFeeCents: input.pricing.vouchServiceFeeCents,
      processingFeeOffsetCents: input.pricing.processingFeeOffsetCents,
      ...(input.providerCustomerId ? { providerCustomerId: input.providerCustomerId } : {}),
      ...(input.providerPaymentMethodId
        ? { providerPaymentMethodId: input.providerPaymentMethodId }
        : {}),
      ...(input.connectedAccountId ? { connectedAccountId: input.connectedAccountId } : {}),
      ...(input.confirmOffSession ? { confirmOffSession: input.confirmOffSession } : {}),
      idempotencyKey: input.idempotencyKey ?? `vouch:${input.vouchId}:payment_authorization`,
    })
    const localStatus = mapStripePaymentIntentStatus(paymentIntent.status)

    await prisma.paymentRecord.upsert({
      where: { vouchId: input.vouchId },
      create: {
        vouchId: input.vouchId,
        provider: "stripe",
        providerPaymentId: paymentIntent.id,
        status: localStatus,
        amountCents: input.pricing.protectedAmountCents,
        currency: input.currency,
        platformFeeCents: input.pricing.vouchServiceFeeCents,
        protectedAmountCents: input.pricing.protectedAmountCents,
        merchantReceivesCents: input.pricing.merchantReceivesCents,
        vouchServiceFeeCents: input.pricing.vouchServiceFeeCents,
        processingFeeOffsetCents: input.pricing.processingFeeOffsetCents,
        applicationFeeAmountCents: input.pricing.applicationFeeAmountCents,
        customerTotalCents: input.pricing.customerTotalCents,
      },
      update: {
        providerPaymentId: paymentIntent.id,
        status: localStatus,
        amountCents: input.pricing.protectedAmountCents,
        currency: input.currency,
        platformFeeCents: input.pricing.vouchServiceFeeCents,
        protectedAmountCents: input.pricing.protectedAmountCents,
        merchantReceivesCents: input.pricing.merchantReceivesCents,
        vouchServiceFeeCents: input.pricing.vouchServiceFeeCents,
        processingFeeOffsetCents: input.pricing.processingFeeOffsetCents,
        applicationFeeAmountCents: input.pricing.applicationFeeAmountCents,
        customerTotalCents: input.pricing.customerTotalCents,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    })

    if (
      ![
        "requires_capture",
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
      ].includes(paymentIntent.status)
    ) {
      return {
        ok: false,
        code: "STRIPE_AUTHORIZATION_NOT_CONFIRMED",
        message: "Stripe has not confirmed payment authorization yet.",
      }
    }

    return {
      ok: true,
      providerPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe payment initialization failed."
    return { ok: false, code: "STRIPE_PAYMENT_INITIALIZATION_FAILED", message }
  }
}

export type ReleaseStripePaymentInput = {
  paymentRecordId: string
  /**
   * Deprecated for destination charges. The connected account is fixed on the
   * PaymentIntent through transfer_data.destination at authorization time.
   */
  connectedAccountId?: string
  idempotencyKey?: string
}

export async function releaseStripePaymentForCompletedVouch(
  input: ReleaseStripePaymentInput
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { id: input.paymentRecordId },
    select: {
      id: true,
      providerPaymentId: true,
      amountCents: true,
      platformFeeCents: true,
      currency: true,
      status: true,
      providerChargeId: true,
    },
  })

  if (!paymentRecord?.providerPaymentId) {
    return {
      ok: false,
      code: "PAYMENT_RECORD_NOT_READY",
      message: "No provider payment ID exists.",
    }
  }

  if (paymentRecord.status !== "authorized") {
    return {
      ok: false,
      code: "PAYMENT_NOT_AUTHORIZED",
      message: "Payment must be provider-authorized before release.",
    }
  }

  try {
    const current = await retrieveStripePaymentIntent({
      providerPaymentId: paymentRecord.providerPaymentId,
    })

    const captured =
      current.status === "requires_capture"
        ? await captureStripePayment({
            providerPaymentId: paymentRecord.providerPaymentId,
            idempotencyKey: input.idempotencyKey ?? `payment:${paymentRecord.id}:capture`,
          })
        : current

    const providerChargeId =
      typeof captured.latest_charge === "string" ? captured.latest_charge : null

    if (captured.status === "canceled") {
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: "voided",
          providerChargeId,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      })
      return {
        ok: false,
        code: "PAYMENT_AUTHORIZATION_VOIDED",
        message: "Stripe authorization is no longer capturable.",
      }
    }

    if (captured.status !== "succeeded" || !providerChargeId) {
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: "release_pending",
          providerChargeId,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      })
      return { ok: true }
    }

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: "released",
        providerChargeId,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    })

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe payment release failed."
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: "failed",
        lastErrorCode: "STRIPE_RELEASE_FAILED",
        lastErrorMessage: message,
      },
    })
    return { ok: false, code: "STRIPE_RELEASE_FAILED", message }
  }
}

export async function refundOrVoidStripePaymentForVouch(input: {
  paymentRecordId: string
  idempotencyKey?: string
  reason:
    | "not_accepted"
    | "confirmation_incomplete"
    | "canceled_before_acceptance"
    | "payment_failure"
    | "provider_required"
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { id: input.paymentRecordId },
    select: {
      id: true,
      vouchId: true,
      providerPaymentId: true,
      amountCents: true,
      customerTotalCents: true,
      status: true,
      refundRecord: {
        select: {
          id: true,
          providerRefundId: true,
          status: true,
        },
      },
      vouch: {
        select: { status: true },
      },
    },
  })

  if (!paymentRecord?.providerPaymentId) {
    return {
      ok: false,
      code: "PAYMENT_RECORD_NOT_READY",
      message: "No provider payment ID exists.",
    }
  }

  try {
    if (
      paymentRecord.refundRecord &&
      ["pending", "succeeded"].includes(paymentRecord.refundRecord.status)
    ) {
      return { ok: true }
    }

    const current = await retrieveStripePaymentIntent({
      providerPaymentId: paymentRecord.providerPaymentId,
    })
    const currentStatus = mapStripePaymentIntentStatus(current.status)

    if (current.status === "requires_capture") {
      await voidStripeAuthorization({
        providerPaymentId: paymentRecord.providerPaymentId,
        idempotencyKey: input.idempotencyKey ?? `payment:${paymentRecord.id}:void`,
      })
      await prisma.$transaction([
        prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: { status: "voided", lastErrorCode: null, lastErrorMessage: null },
        }),
        prisma.refundRecord.upsert({
          where: { vouchId: paymentRecord.vouchId },
          create: {
            vouchId: paymentRecord.vouchId,
            paymentRecordId: paymentRecord.id,
            status: "succeeded",
            reason: input.reason,
            amountCents: paymentRecord.customerTotalCents || paymentRecord.amountCents,
          },
          update: { status: "succeeded", reason: input.reason },
        }),
      ])
      return { ok: true }
    }

    if (current.status === "canceled") {
      await prisma.$transaction([
        prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: { status: "voided", lastErrorCode: null, lastErrorMessage: null },
        }),
        prisma.refundRecord.upsert({
          where: { vouchId: paymentRecord.vouchId },
          create: {
            vouchId: paymentRecord.vouchId,
            paymentRecordId: paymentRecord.id,
            status: "succeeded",
            reason: input.reason,
            amountCents: paymentRecord.customerTotalCents || paymentRecord.amountCents,
          },
          update: { status: "succeeded", reason: input.reason },
        }),
      ])
      return { ok: true }
    }

    if (current.status !== "succeeded") {
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: { status: currentStatus, lastErrorCode: null, lastErrorMessage: null },
      })
      return { ok: true }
    }

    const refund = await refundStripePayment({
      providerPaymentId: paymentRecord.providerPaymentId,
      idempotencyKey: input.idempotencyKey ?? `payment:${paymentRecord.id}:refund`,
    })

    await prisma.$transaction([
      prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: { status: "refund_pending", lastErrorCode: null, lastErrorMessage: null },
      }),
      prisma.refundRecord.upsert({
        where: { vouchId: paymentRecord.vouchId },
        create: {
          vouchId: paymentRecord.vouchId,
          paymentRecordId: paymentRecord.id,
          providerRefundId: refund.id,
          status: "pending",
          reason: input.reason,
          amountCents: paymentRecord.customerTotalCents || paymentRecord.amountCents,
        },
        update: {
          providerRefundId: refund.id,
          status: "pending",
          reason: input.reason,
        },
      }),
    ])

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe refund/void failed."
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: "failed",
        lastErrorCode: "STRIPE_REFUND_OR_VOID_FAILED",
        lastErrorMessage: message,
      },
    })
    return { ok: false, code: "STRIPE_REFUND_OR_VOID_FAILED", message }
  }
}

export type StripeWebhookProcessingResult =
  | { ok: true; status: 200; processed: true; ignored?: false }
  | { ok: true; status: 200; processed: false; ignored: true; reason: string }
  | { ok: false; status: 500; message: string }

export async function processStripeWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookProcessingResult> {
  const ledger = await recordProviderWebhookReceived({
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: {
      livemode: event.livemode,
      api_version: event.api_version,
    },
  })

  if (ledger.processed) {
    return { ok: true, status: 200, processed: false, ignored: true, reason: "Already processed." }
  }

  try {
    if (isStripeIdentityEvent(event)) {
      await markProviderWebhookIgnored(ledger.id, "Handled by verification webhook processor.")
      return {
        ok: true,
        status: 200,
        processed: false,
        ignored: true,
        reason: "Delegated event type.",
      }
    }

    if (isStripeAccountEvent(event)) {
      await processAccountEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    if (isStripeSetupIntentEvent(event)) {
      await processSetupIntentEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    if (isStripeCheckoutSessionEvent(event)) {
      await processCheckoutSessionEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    if (isStripePaymentIntentEvent(event)) {
      await processPaymentIntentEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    if (isStripeRefundEvent(event)) {
      await processRefundEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    await markProviderWebhookIgnored(ledger.id, "Unsupported Stripe event type.")
    return {
      ok: true,
      status: 200,
      processed: false,
      ignored: true,
      reason: "Unsupported event type.",
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Stripe webhook processing error."
    await markProviderWebhookFailed(ledger.id, message)
    return { ok: false, status: 500, message }
  }
}

async function processCheckoutSessionEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const session = event.data.object as Stripe.Checkout.Session
  const providerPaymentId = getCheckoutSessionPaymentIntentId(session)
  const paymentIntent = providerPaymentId
    ? await retrieveStripePaymentIntent({ providerPaymentId })
    : null
  const localStatus = paymentIntent
    ? mapStripePaymentIntentStatus(paymentIntent.status)
    : "requires_payment_method"
  const providerChargeId =
    paymentIntent && typeof paymentIntent.latest_charge === "string"
      ? paymentIntent.latest_charge
      : undefined

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      OR: [
        { providerCheckoutSessionId: session.id },
        ...(providerPaymentId ? [{ providerPaymentId }] : []),
      ],
    },
    select: { id: true, vouchId: true },
  })

  if (!paymentRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          checkout_session: session.id,
          payment_intent: providerPaymentId,
          reason: "No local payment record matched this Checkout Session.",
        },
      },
    })
    return
  }

  await prisma.$transaction([
    prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        providerCheckoutSessionId: session.id,
        ...(providerPaymentId ? { providerPaymentId } : {}),
        ...(providerChargeId ? { providerChargeId } : {}),
        status: localStatus,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    }),
    prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          checkout_session: session.id,
          payment_intent: providerPaymentId,
          payment_status: session.payment_status,
          status: paymentIntent?.status,
        },
      },
    }),
    prisma.auditEvent.create({
      data: {
        eventName: "payment.checkout_webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: event.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          checkout_session: session.id,
          payment_intent: providerPaymentId,
          status: paymentIntent?.status,
        },
      },
    }),
  ])
}

async function processPaymentIntentEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const intent = event.data.object as Stripe.PaymentIntent
  const localStatus = mapStripePaymentIntentStatus(intent.status)

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: { providerPaymentId: intent.id },
    select: { id: true, vouchId: true, status: true },
  })

  if (!paymentRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          payment_intent: intent.id,
          reason: "No local payment record matched this provider payment ID.",
        },
      },
    })
    return
  }

  const providerChargeId =
    typeof intent.latest_charge === "string" ? intent.latest_charge : undefined
  const nextStatus =
    paymentRecord.status === "released" && localStatus === "captured" ? "released" : localStatus

  await prisma.$transaction([
    prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: nextStatus,
        ...(providerChargeId ? { providerChargeId } : {}),
        lastErrorCode: intent.last_payment_error?.code ?? null,
        lastErrorMessage: intent.last_payment_error?.message ?? null,
      },
    }),
    prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          payment_intent: intent.id,
          status: intent.status,
        },
      },
    }),
    prisma.auditEvent.create({
      data: {
        eventName: "payment.webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: event.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          payment_intent: intent.id,
          status: intent.status,
        },
      },
    }),
  ])
}

async function processRefundEvent(event: Stripe.Event, providerWebhookEventId: string) {
  if (event.type === "charge.refunded") {
    await processChargeRefundedEvent(event, providerWebhookEventId)
    return
  }

  const refund = event.data.object as Stripe.Refund
  const localStatus = mapStripeRefundStatus(refund.status)

  const refundRecord = await prisma.refundRecord.findFirst({
    where: { providerRefundId: refund.id },
    select: { id: true, vouchId: true, paymentRecordId: true },
  })

  if (!refundRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          refund: refund.id,
          reason: "No local refund record matched this provider refund ID.",
        },
      },
    })
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.refundRecord.update({
      where: { id: refundRecord.id },
      data: { status: localStatus },
    })
    await tx.paymentRecord.update({
      where: { id: refundRecord.paymentRecordId },
      data: { status: localStatus === "succeeded" ? "refunded" : "refund_pending" },
    })
    await tx.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: refundRecord.vouchId,
        paymentRecordId: refundRecord.paymentRecordId,
        refundRecordId: refundRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          refund: refund.id,
          status: refund.status,
        },
      },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payment.webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: event.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          refund: refund.id,
          status: refund.status,
        },
      },
    })
    if (localStatus === "succeeded") {
      await tx.vouch.update({
        where: { id: refundRecord.vouchId },
        data: { status: "refunded" },
      })
    }
  })
}

async function processSetupIntentEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const setupIntent = event.data.object as Stripe.SetupIntent
  const userId = setupIntent.metadata?.vouch_user_id
  const providerCustomerId =
    typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id

  if (!userId || !providerCustomerId) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          setup_intent: setupIntent.id,
          reason: "SetupIntent did not include Vouch user metadata and customer reference.",
        },
      },
    })
    return
  }

  const readiness =
    setupIntent.status === "succeeded"
      ? (await getStripeCustomerPaymentReadiness(providerCustomerId)).readiness
      : setupIntent.status === "requires_payment_method"
        ? "requires_action"
        : "failed"

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.upsert({
      where: { userId },
      create: { userId, providerCustomerId },
      update: { providerCustomerId },
    })
    await tx.verificationProfile.upsert({
      where: { userId },
      create: { userId, paymentReadiness: readiness },
      update: { paymentReadiness: readiness },
    })
    await tx.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          setup_intent: setupIntent.id,
          status: setupIntent.status,
          customer: providerCustomerId,
        },
      },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payment.setup_webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentCustomer",
        entityId: userId,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          status: setupIntent.status,
        },
      },
    })
  })
}

async function processAccountEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const account = event.data.object as Stripe.Account
  const readiness =
    account.charges_enabled && account.payouts_enabled && account.details_submitted
      ? "ready"
      : account.requirements?.disabled_reason
        ? "restricted"
        : "requires_action"

  const connectedAccount = await prisma.connectedAccount.findUnique({
    where: { providerAccountId: account.id },
    select: { id: true, userId: true },
  })

  if (!connectedAccount) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          account: account.id,
          reason: "No local connected account matched this provider account ID.",
        },
      },
    })
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.update({
      where: { id: connectedAccount.id },
      data: {
        readiness,
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        detailsSubmitted: Boolean(account.details_submitted),
      },
    })
    await tx.verificationProfile.upsert({
      where: { userId: connectedAccount.userId },
      create: { userId: connectedAccount.userId, payoutReadiness: readiness },
      update: { payoutReadiness: readiness },
    })
    await tx.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          account: account.id,
          readiness,
          charges_enabled: Boolean(account.charges_enabled),
          payouts_enabled: Boolean(account.payouts_enabled),
          details_submitted: Boolean(account.details_submitted),
        },
      },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payout.account_webhook_processed",
        actorType: "payment_provider",
        entityType: "ConnectedAccount",
        entityId: connectedAccount.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          account: account.id,
          readiness,
        },
      },
    })
  })
}

async function processChargeRefundedEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const charge = event.data.object as Stripe.Charge
  const providerPaymentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      OR: [{ providerChargeId: charge.id }, ...(providerPaymentId ? [{ providerPaymentId }] : [])],
    },
    select: { id: true, vouchId: true, customerTotalCents: true, amountCents: true },
  })

  if (!paymentRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          charge: charge.id,
          payment_intent: providerPaymentId,
          reason: "No local payment record matched this refunded charge.",
        },
      },
    })
    return
  }

  await prisma.$transaction(async (tx) => {
    const refundRecord = await tx.refundRecord.upsert({
      where: { vouchId: paymentRecord.vouchId },
      create: {
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        status: "succeeded",
        reason: "provider_required",
        amountCents:
          charge.amount_refunded || paymentRecord.customerTotalCents || paymentRecord.amountCents,
      },
      update: {
        status: "succeeded",
        reason: "provider_required",
        amountCents:
          charge.amount_refunded || paymentRecord.customerTotalCents || paymentRecord.amountCents,
      },
    })
    await tx.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: { status: "refunded", providerChargeId: charge.id },
    })
    await tx.vouch.update({
      where: { id: paymentRecord.vouchId },
      data: { status: "refunded" },
    })
    await tx.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        refundRecordId: refundRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          charge: charge.id,
          payment_intent: providerPaymentId,
          amount_refunded: charge.amount_refunded,
        },
      },
    })
  })
}

export async function reconcileStuckPaymentRecords(input?: {
  limit?: number
}): Promise<{ reconciledCount: number; failedCount: number }> {
  const stripe = getStripeServerClient()
  const records = await prisma.paymentRecord.findMany({
    where: {
      provider: "stripe",
      providerPaymentId: { not: null },
      status: {
        in: ["requires_payment_method", "authorized", "release_pending", "refund_pending"],
      },
    },
    take: input?.limit ?? 50,
    orderBy: { updatedAt: "asc" },
    select: { id: true, providerPaymentId: true },
  })

  let reconciledCount = 0
  let failedCount = 0

  for (const record of records) {
    if (!record.providerPaymentId) continue
    try {
      const intent = await stripe.paymentIntents.retrieve(record.providerPaymentId)
      await prisma.paymentRecord.update({
        where: { id: record.id },
        data: {
          status: mapStripePaymentIntentStatus(intent.status),
          lastErrorCode: intent.last_payment_error?.code ?? null,
          lastErrorMessage: intent.last_payment_error?.message ?? null,
        },
      })
      reconciledCount += 1
    } catch {
      failedCount += 1
    }
  }

  return { reconciledCount, failedCount }
}

export async function runPaymentReconciliationJob(input?: {
  limit?: number
}): Promise<{ reconciledCount: number; failedCount: number }> {
  const payments = await reconcileStuckPaymentRecords(input)
  const refunds = await prisma.refundRecord.findMany({
    where: { providerRefundId: { not: null }, status: { in: ["pending", "failed"] } },
    take: input?.limit ?? 50,
    select: { id: true, paymentRecordId: true, providerRefundId: true },
  })
  const stripe = getStripeServerClient()
  let refundReconciled = 0
  let refundFailed = 0

  for (const refundRecord of refunds) {
    if (!refundRecord.providerRefundId) continue
    try {
      const refund = await stripe.refunds.retrieve(refundRecord.providerRefundId)
      const status = mapStripeRefundStatus(refund.status)
      await prisma.$transaction([
        prisma.refundRecord.update({ where: { id: refundRecord.id }, data: { status } }),
        prisma.paymentRecord.update({
          where: { id: refundRecord.paymentRecordId },
          data: { status: status === "succeeded" ? "refunded" : "refund_pending" },
        }),
      ])
      refundReconciled += 1
    } catch {
      refundFailed += 1
    }
  }

  return {
    reconciledCount: payments.reconciledCount + refundReconciled,
    failedCount: payments.failedCount + refundFailed,
  }
}

export async function recordProviderWebhookReceived(input: ProviderWebhookLedgerInput) {
  return prisma.providerWebhookEvent.upsert({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId,
      },
    },
    create: {
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      status: "received",
      processed: false,
      safeMetadata: (input.safeMetadata ?? {}) as Prisma.InputJsonValue,
    },
    update: {},
  })
}

export async function markProviderWebhookProcessed(id: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "processed",
      processed: true,
      processedAt: new Date(),
      processingError: null,
    },
  })
}

export async function markProviderWebhookIgnored(id: string, reason: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
      processingError: reason,
    },
  })
}

export async function markProviderWebhookFailed(id: string, error: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "failed",
      processed: false,
      processingError: error,
    },
  })
}
