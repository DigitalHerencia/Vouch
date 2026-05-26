"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type Stripe from "stripe"

import { getParticipantRoleForVouch } from "@/lib/authz/participants"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import { getAggregateConfirmationStatusTx } from "@/lib/db/transactions/confirmationTransactions"
import {
  updatePaymentProviderStateTx,
  upsertPaymentRecordTx,
} from "@/lib/db/transactions/paymentTransactions"
import { markVouchCompletedTx } from "@/lib/db/transactions/vouchTransactions"
import {
  createStripeConnectAccount,
  createStripeConnectDashboardLink,
  createStripeConnectOnboardingLink,
  refreshStripeConnectReadiness,
} from "@/lib/integrations/stripe/connect"
import {
  createStripeCustomer,
  createStripeCustomerPortalSession,
  createStripeSetupIntent,
  getStripeCustomerPaymentReadiness,
  retrieveStripeSetupIntent,
  setStripeCustomerDefaultPaymentMethod,
} from "@/lib/integrations/stripe/customers"
import {
  captureStripePayment,
  retrieveStripePaymentIntent,
} from "@/lib/integrations/stripe/payment-intents"
import {
  createStripeCheckoutAuthorization,
  createStripePaymentMethodSetupCheckout,
} from "@/lib/integrations/stripe/checkout-sessions"
import {
  getPaymentIntentCaptureBefore,
  getPaymentIntentLatestChargeId,
  isPaymentIntentCapturable,
  mapStripePaymentIntentSettlementStatus,
  mapStripePaymentIntentStatus,
} from "@/lib/integrations/stripe/status-map"
import {
  authorizeVouchPaymentInputSchema,
  captureConfirmedVouchPaymentInputSchema,
  paymentProviderReturnInputSchema,
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
  redirectTo?: string
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
    select: { providerAccountId: true, readiness: true },
  })

  if (!connectedAccount?.providerAccountId) {
    await startStripeConnectOnboarding()
    redirect("/dashboard")
  }

  const readiness = await refreshStripeConnectReadiness({
    providerAccountId: connectedAccount.providerAccountId,
  })

  await prisma.connectedAccount.updateMany({
    where: { userId: user.id, providerAccountId: connectedAccount.providerAccountId },
    data: {
      readiness: readiness.readiness,
      chargesEnabled: readiness.chargesEnabled,
      payoutsEnabled: readiness.payoutsEnabled,
      detailsSubmitted: readiness.detailsSubmitted,
      lastProviderSyncAt: new Date(),
    },
  })

  if (readiness.readiness !== "ready") {
    await startStripeConnectOnboarding()
    redirect("/dashboard")
  }

  const link = await createStripeConnectDashboardLink({
    providerAccountId: connectedAccount.providerAccountId,
  })

  redirect(link.url)
}

export async function openStripePaymentMethodDashboard(): Promise<never> {
  const user = await requireActiveUser()
  const existing = await prisma.paymentCustomer.findUnique({
    where: { userId: user.id },
    select: { providerCustomerId: true, readiness: true },
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

  const readiness = await getStripeCustomerPaymentReadiness(providerCustomerId)

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        providerCustomerId,
        readiness: readiness.readiness,
        lastProviderSyncAt: new Date(),
      },
      update: {
        providerCustomerId,
        readiness: readiness.readiness,
        lastProviderSyncAt: new Date(),
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName:
          readiness.readiness === "ready"
            ? "payment.customer_portal_started"
            : "payment.customer_setup_checkout_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "PaymentCustomer",
        entityId: user.id,
        participantSafe: false,
        metadata: { provider: "stripe" },
      },
    })
  })

  const appUrl = getAppUrl()

  if (readiness.readiness !== "ready") {
    const checkout = await createStripePaymentMethodSetupCheckout({
      userId: user.id,
      providerCustomerId,
      successUrl: `${appUrl}/dashboard?stripe_payment_return=1`,
      cancelUrl: `${appUrl}/dashboard?stripe_payment_cancelled=1`,
      idempotencyKey: `user:${user.id}:payment-method-setup-checkout`,
    })

    await revalidatePaymentSurfaces({ userId: user.id })
    redirect(checkout.url ?? "/dashboard")
  }

  const link = await createStripeCustomerPortalSession({
    providerCustomerId,
    returnUrl: `${appUrl}/dashboard?stripe_payment_return=1`,
  })

  await revalidatePaymentSurfaces({ userId: user.id })
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
  const user = await requireActiveUser()
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
  if (vouch.customerId !== user.id) {
    return actionFailure("AUTHZ_DENIED", "Customer access required.")
  }
  if (!vouch.customerId) return actionFailure("CUSTOMER_REQUIRED", "Customer is required.")
  if (!vouch.customer?.paymentCustomer?.providerCustomerId) {
    return actionFailure("PAYMENT_CUSTOMER_REQUIRED", "Customer payment setup is required.")
  }
  if (!vouch.merchant.connectedAccount?.providerAccountId) {
    return actionFailure("CONNECTED_ACCOUNT_REQUIRED", "Merchant connected account is required.")
  }

  const customerPaymentReadiness = await getStripeCustomerPaymentReadiness(
    vouch.customer.paymentCustomer.providerCustomerId
  )

  if (!customerPaymentReadiness.defaultPaymentMethodId) {
    return actionFailure("PAYMENT_METHOD_REQUIRED", "Customer payment setup is required.")
  }

  const appUrl = getAppUrl()
  const checkout = await createStripeCheckoutAuthorization({
    vouchId: vouch.id,
    pricing: {
      protectedAmountCents: vouch.protectedAmountCents,
      merchantReceivesCents: vouch.merchantReceivesCents,
      vouchServiceFeeCents: vouch.vouchServiceFeeCents,
      processingFeeOffsetCents: vouch.processingFeeOffsetCents,
      applicationFeeAmountCents: vouch.applicationFeeAmountCents,
      customerTotalCents: vouch.customerTotalCents,
    },
    currency: vouch.currency,
    providerCustomerId: vouch.customer.paymentCustomer.providerCustomerId,
    connectedAccountId: vouch.merchant.connectedAccount.providerAccountId,
    successUrl: `${appUrl}/vouches/${vouch.id}?stripe_authorization_return=1`,
    cancelUrl: `${appUrl}/vouches/${vouch.id}?stripe_authorization_canceled=1`,
    idempotencyKey: parsed.data.idempotencyKey ?? `vouch:${vouch.id}:authorize`,
  })

  const paymentRecord = await prisma.$transaction(async (tx) => {
    const record = await upsertPaymentRecordTx(tx, {
      vouchId: vouch.id,
      purpose: "customer_authorization",
      providerCheckoutSessionId: checkout.id,
      status: "checkout_created",
      settlementStatus: "pending",
      amountCents: vouch.protectedAmountCents,
      currency: vouch.currency,
      protectedAmountCents: vouch.protectedAmountCents,
      merchantReceivesCents: vouch.merchantReceivesCents,
      vouchServiceFeeCents: vouch.vouchServiceFeeCents,
      processingFeeOffsetCents: vouch.processingFeeOffsetCents,
      applicationFeeAmountCents: vouch.applicationFeeAmountCents,
      customerTotalCents: vouch.customerTotalCents,
      amountCapturableCents: 0,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "payment.authorization_checkout_created",
        actorType: "stripe",
        entityType: "PaymentRecord",
        entityId: record.id,
        participantSafe: true,
        metadata: {
          checkout_session_id: checkout.id,
          payment_role: "customer_commitment",
        },
      },
    })

    return record
  })

  await revalidatePaymentSurfaces({ vouchId: vouch.id })
  return actionSuccess({
    paymentRecordId: paymentRecord.id,
    vouchId: paymentRecord.vouchId,
    status: paymentRecord.status,
    settlementStatus: paymentRecord.settlementStatus,
    ...(checkout.url ? { redirectTo: checkout.url } : {}),
  })
}

export async function captureConfirmedVouchPayment(
  input: unknown
): Promise<ActionResult<PaymentActionResult>> {
  const user = await requireActiveUser()
  const parsed = captureConfirmedVouchPaymentInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the capture fields.")
  }

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: {
      vouchId_purpose: {
        vouchId: parsed.data.vouchId,
        purpose: "customer_authorization",
      },
    },
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

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: paymentRecord.vouch.merchantId,
    customerId: paymentRecord.vouch.customerId,
  })

  if (!participantRole) {
    return actionFailure("AUTHZ_DENIED", "Participant access required.")
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

/**
 * Compatibility aliases retained temporarily.
 */
export const startPayoutOnboarding = startStripeConnectOnboarding
export const openPayoutDashboard = openStripeConnectDashboard
export const openPaymentMethodDashboard = openStripePaymentMethodDashboard
export const createStripeAccountSessionAction = openStripeConnectDashboard
export const initializeVouchPayment = authorizeVouchPayment
export const initializeStripePaymentForVouch = authorizeVouchPayment
export const releaseStripePaymentForCompletedVouch = captureConfirmedVouchPayment
export const captureOrReleaseVouchPayment = captureConfirmedVouchPayment
