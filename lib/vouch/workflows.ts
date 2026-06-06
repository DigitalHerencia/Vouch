import "server-only"

import { revalidatePath } from "next/cache"

import { getParticipantRoleForVouch } from "@/lib/authz/participants"
import { VOUCH_LIMITS } from "@/lib/constants/limits"
import { prisma } from "@/lib/db/prisma"
import {
  createPresenceConfirmationTx,
  getAggregateConfirmationStatusTx,
} from "@/lib/db/transactions/confirmationTransactions"
import {
  bindCustomerToVouchTx,
  createVouchTx,
  updateVouchArchiveStatusTx,
} from "@/lib/db/transactions/vouchTransactions"
import {
  getCurrentUserConnectedAccount,
  getCurrentUserPaymentCustomer,
  requireActiveUser,
} from "@/lib/fetchers/authFetchers"
import {
  assertCreateVouchReadinessReady,
  getCreateVouchReadinessGate,
} from "@/lib/fetchers/readinessFetchers"
import { getVouchParticipantActionState } from "@/lib/fetchers/vouchFetchers"
import {
  createStripeCheckoutAuthorization,
  createStripeMerchantCreationFeeCheckout,
  retrieveStripeAuthorizationCheckout,
} from "@/lib/integrations/stripe/checkout-sessions"
import {
  cancelStripeAuthorization,
  captureStripePayment,
  retrieveStripePaymentIntent,
} from "@/lib/integrations/stripe/payment-intents"
import { syncConnectedAccountReadinessForUser } from "@/lib/payments/stripeReadinessSync"
import { verifyConfirmationCode } from "@/lib/vouch/confirmation-codes"
import { calculateVouchPricing } from "@/lib/vouch/fees"
import { createVouchRecoverySnapshot } from "@/lib/vouch/reconciliation"
import {
  archiveVouchSchema,
  confirmCreateVouchSchema,
  confirmPresenceSchema,
  createVouchDraftSchema,
  feePreviewInputSchema,
} from "@/schemas/vouchSchemas"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-resultTypes"
import { type VouchPricing } from "@/types/vouchTypes"

type FieldErrorsSource = {
  flatten(): { fieldErrors: Record<string, string[]> }
}

type FeePreview = {
  amountCents: number
  currency: "usd"
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  customerTotalCents: number
  totalCents: number
}

type CreatedVouchResult = {
  vouchId: string
  detailPath: string
  checkoutUrl?: string
}

type CustomerAuthorizationCheckoutResult = {
  vouchId: string
  checkoutUrl: string | null
}

const CURRENT_VOUCH_DISCLAIMER_VERSION = "2026-06-05"

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

function getFieldErrors(error: FieldErrorsSource) {
  return error.flatten().fieldErrors
}

function calculatePricing(amountCents: number): VouchPricing {
  return calculateVouchPricing({ protectedAmountCents: amountCents })
}

function toFeePreview(amountCents: number, currency: "usd"): FeePreview {
  const pricing = amountCents > 0 ? calculatePricing(amountCents) : null

  return {
    amountCents,
    currency,
    protectedAmountCents: pricing?.protectedAmountCents ?? amountCents,
    merchantReceivesCents: pricing?.merchantReceivesCents ?? amountCents,
    vouchServiceFeeCents: pricing?.vouchServiceFeeCents ?? 0,
    customerTotalCents: pricing?.customerTotalCents ?? amountCents,
    totalCents: pricing?.customerTotalCents ?? amountCents,
  }
}

function getConfirmationWindow(appointmentStartsAt: Date) {
  return {
    confirmationOpensAt: new Date(appointmentStartsAt.getTime() - 60 * 60 * 1000),
    confirmationExpiresAt: new Date(appointmentStartsAt.getTime() + 60 * 60 * 1000),
  }
}

function getStripeId(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === "string" ? id : undefined
  }

  return undefined
}

function getCaptureBefore(paymentIntent: Awaited<ReturnType<typeof retrieveStripePaymentIntent>>) {
  const charge = paymentIntent.latest_charge
  if (!charge || typeof charge === "string" || !charge.payment_method_details?.card) return null

  const captureBefore = charge.payment_method_details.card.capture_before
  return typeof captureBefore === "number" ? new Date(captureBefore * 1000) : null
}

function mapPaymentIntentRecordStatus(
  status: Awaited<ReturnType<typeof retrieveStripePaymentIntent>>["status"]
) {
  switch (status) {
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "processing":
    case "requires_capture":
    case "canceled":
    case "succeeded":
      return status
  }
}

export async function refreshCustomerDepositPaymentIntent(input: {
  vouchId: string
  stripePaymentIntentId: string
  stripeAccountId: string
  stripeEventId?: string
}): Promise<void> {
  // Direct-charge objects belong to the merchant account and must always be retrieved in its scope.
  const paymentIntent = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.stripePaymentIntentId,
    connectedAccountId: input.stripeAccountId,
  })
  const now = new Date()
  const status = mapPaymentIntentRecordStatus(paymentIntent.status)

  await prisma.paymentIntentRecord.updateMany({
    where: {
      vouchId: input.vouchId,
      purpose: "customer_deposit_authorization",
      stripePaymentIntentId: input.stripePaymentIntentId,
      stripeAccountId: input.stripeAccountId,
    },
    data: {
      status,
      captureBefore: getCaptureBefore(paymentIntent),
      ...(status === "requires_capture" ? { authorizedAt: now } : {}),
      ...(status === "canceled" ? { canceledAt: now } : {}),
      ...(status === "succeeded" ? { succeededAt: now } : {}),
      ...(input.stripeEventId ? { lastStripeEventId: input.stripeEventId } : {}),
      syncedAt: now,
    },
  })

  if (status === "requires_capture") {
    await prisma.vouch.updateMany({
      where: { id: input.vouchId, status: "protocol_fee_paid" },
      data: { status: "authorized", authorizedAt: now },
    })
  } else if (status === "succeeded") {
    // Provider success synchronizes payment truth only; it must never grant capture eligibility.
    await prisma.vouch.updateMany({
      where: {
        id: input.vouchId,
        status: "can_capture",
        presenceConfirmation: {
          status: "can_capture",
          merchantConfirmedAt: { not: null },
          customerConfirmedAt: { not: null },
        },
      },
      data: { status: "captured", capturedAt: now },
    })
  } else if (status === "canceled") {
    await prisma.vouch.updateMany({
      where: { id: input.vouchId, status: { in: ["authorized", "can_capture"] } },
      data: { status: "expired", voidedAt: now, expiredAt: now },
    })
  }
}

async function captureCustomerDepositForVouch(vouchId: string): Promise<void> {
  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      status: "can_capture",
      presenceConfirmation: {
        status: "can_capture",
        merchantConfirmedAt: { not: null },
        customerConfirmedAt: { not: null },
      },
    },
    select: {
      appointmentAt: true,
      presenceConfirmation: {
        select: {
          windowOpensAt: true,
          windowClosesAt: true,
          merchantConfirmedAt: true,
          customerConfirmedAt: true,
        },
      },
      paymentIntents: {
        where: { purpose: "customer_deposit_authorization", status: "requires_capture" },
        take: 1,
        select: { id: true, stripePaymentIntentId: true, stripeAccountId: true },
      },
    },
  })
  const payment = vouch?.paymentIntents[0]

  if (!vouch || !payment?.stripePaymentIntentId || !payment.stripeAccountId) {
    throw new Error("CUSTOMER_DEPOSIT_AUTHORIZATION_NOT_FOUND")
  }
  const presence = vouch.presenceConfirmation
  const recoveryCutoff = new Date(vouch.appointmentAt.getTime() + 24 * 60 * 60 * 1000)
  if (
    !presence?.merchantConfirmedAt ||
    !presence.customerConfirmedAt ||
    presence.merchantConfirmedAt < presence.windowOpensAt ||
    presence.merchantConfirmedAt > presence.windowClosesAt ||
    presence.customerConfirmedAt < presence.windowOpensAt ||
    presence.customerConfirmedAt > presence.windowClosesAt ||
    new Date() > recoveryCutoff
  ) {
    throw new Error("CAPTURE_NOT_ELIGIBLE")
  }

  await createVouchRecoverySnapshot(vouchId, "before_capture")
  try {
    await captureStripePayment({
      providerPaymentIntentId: payment.stripePaymentIntentId,
      connectedAccountId: payment.stripeAccountId,
      idempotencyKey: `vouch:${vouchId}:capture`,
    })
  } catch (error) {
    const existingRetry = await prisma.operationalRetry.findFirst({
      where: {
        operation: "reconcile_payment_intent",
        entityType: "PaymentIntentRecord",
        entityId: payment.id,
        status: { in: ["pending", "failed"] },
      },
      select: { id: true },
    })
    const retryData = {
      status: "pending" as const,
      nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000),
      failureReason: error instanceof Error ? error.message : String(error),
    }

    if (existingRetry) {
      await prisma.operationalRetry.update({
        where: { id: existingRetry.id },
        data: retryData,
      })
    } else {
      await prisma.operationalRetry.create({
        data: {
          vouchId,
          operation: "reconcile_payment_intent",
          entityType: "PaymentIntentRecord",
          entityId: payment.id,
          maxAttempts: 288,
          ...retryData,
        },
      })
    }
    throw error
  }
  await refreshCustomerDepositPaymentIntent({
    vouchId,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    stripeAccountId: payment.stripeAccountId,
  })
}

async function mapReadinessFailure(
  assertion: Promise<unknown>
): Promise<ActionResult<never> | null> {
  try {
    await assertion
    return null
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (error.message.startsWith("READINESS_BLOCKED:")) {
      return actionFailure("READINESS_BLOCKED", "Required account readiness is incomplete.")
    }
    throw error
  }
}

function revalidateVouchSurfaces(vouchId: string): void {
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")
  revalidatePath(`/vouches/${vouchId}`)
}

export async function calculatePlatformFee(input: unknown): Promise<ActionResult<FeePreview>> {
  const parsed = feePreviewInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the amount.", getFieldErrors(parsed.error))
  }

  return actionSuccess(toFeePreview(parsed.data.amountCents, "usd"))
}

export async function validateCreateVouchDraft(input: unknown): Promise<ActionResult<FeePreview>> {
  const parsed = createVouchDraftSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the draft fields.",
      getFieldErrors(parsed.error)
    )
  }

  return actionSuccess(toFeePreview(parsed.data.amountCents, parsed.data.currency))
}

export async function getCreateVouchFormReadiness(input?: {
  syncStripeConnectReturn?: boolean
}): Promise<ActionResult<{ onboardingRequired: boolean }>> {
  const user = await requireActiveUser()

  if (input?.syncStripeConnectReturn) {
    const connectedAccount = await getCurrentUserConnectedAccount()

    if (connectedAccount?.stripeAccountId) {
      await syncConnectedAccountReadinessForUser({
        userId: user.id,
        stripeAccountId: connectedAccount.stripeAccountId,
      })
    }
  }

  const gate = await getCreateVouchReadinessGate(user.id)

  return actionSuccess({
    onboardingRequired: !gate.allowed || gate.readiness?.payoutReadiness !== "ready",
  })
}

export async function createVouch(input: unknown): Promise<ActionResult<CreatedVouchResult>> {
  const user = await requireActiveUser()
  const readinessFailure = await mapReadinessFailure(assertCreateVouchReadinessReady(user.id))
  if (readinessFailure) return readinessFailure

  const parsed = confirmCreateVouchSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const amountCents = parsed.data.amountCents
  if (amountCents < VOUCH_LIMITS.minAmountCents || amountCents > VOUCH_LIMITS.maxAmountCents) {
    return actionFailure(
      "AMOUNT_OUT_OF_RANGE",
      `Amount must be between ${VOUCH_LIMITS.minAmountCents} and ${VOUCH_LIMITS.maxAmountCents} cents.`
    )
  }

  const pricing = calculatePricing(amountCents)
  const merchantFeeCents = pricing.vouchServiceFeeCents
  const paymentCustomer = await getCurrentUserPaymentCustomer()
  const { confirmationOpensAt, confirmationExpiresAt } = getConfirmationWindow(
    parsed.data.appointmentStartsAt
  )

  const vouch = await prisma.$transaction(async (tx) => {
    const disclaimerAcceptedAt = new Date()
    const created = await createVouchTx(tx, {
      merchantId: user.id,
      currency: parsed.data.currency,
      protectedAmountCents: pricing.protectedAmountCents,
      appointmentStartsAt: parsed.data.appointmentStartsAt,
      disclaimerAcceptedAt,
      createAsDraft: true,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.creation_fee_checkout_required",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: created.id,
        metadata: {
          protected_amount_cents: pricing.protectedAmountCents,
          merchant_receives_cents: pricing.merchantReceivesCents,
          vouch_service_fee_cents: pricing.vouchServiceFeeCents,
          customer_total_cents: pricing.customerTotalCents,
          appointment_starts_at: parsed.data.appointmentStartsAt.toISOString(),
          confirmation_opens_at: confirmationOpensAt.toISOString(),
          confirmation_expires_at: confirmationExpiresAt.toISOString(),
          disclaimer_version: CURRENT_VOUCH_DISCLAIMER_VERSION,
          disclaimer_accepted_at: disclaimerAcceptedAt.toISOString(),
        },
      },
    })

    return created
  })

  const appUrl = getAppUrl()
  const checkout = await createStripeMerchantCreationFeeCheckout({
    vouchId: vouch.id,
    merchantUserId: user.id,
    feeAmountCents: merchantFeeCents,
    protectedAmountCents: pricing.protectedAmountCents,
    currency: parsed.data.currency,
    expiresAt: parsed.data.appointmentStartsAt,
    successUrl: `${appUrl}/vouches/${vouch.id}?merchant_fee=paid`,
    cancelUrl: `${appUrl}/vouches/new?merchant_fee=cancelled`,
    idempotencyKey: `vouch:${vouch.id}:merchant-fee-checkout`,
    ...(paymentCustomer?.stripeCustomerId
      ? { providerCustomerId: paymentCustomer.stripeCustomerId }
      : {}),
  })

  revalidateVouchSurfaces(vouch.id)

  return actionSuccess({
    vouchId: vouch.id,
    detailPath: `/vouches/${vouch.id}`,
    ...(checkout.url ? { checkoutUrl: checkout.url } : {}),
  })
}

export async function ensureCustomerAuthorizationCheckoutForVouch(
  vouchId: string
): Promise<ActionResult<CustomerAuthorizationCheckoutResult>> {
  const vouch = await prisma.vouch.findUnique({
    where: { id: vouchId },
    select: {
      id: true,
      merchantId: true,
      amountCents: true,
      currency: true,
      appointmentAt: true,
      confirmationExpiresAt: true,
      protocolFeePaidAt: true,
      merchant: {
        select: {
          connectedAccount: {
            select: {
              stripeAccountId: true,
              chargesEnabled: true,
              payoutsEnabled: true,
              detailsSubmitted: true,
            },
          },
        },
      },
      paymentIntents: {
        where: { purpose: "customer_deposit_authorization" },
        take: 1,
        select: {
          id: true,
          stripeCheckoutSessionUrl: true,
        },
      },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (!vouch.protocolFeePaidAt) {
    return actionFailure("PROTOCOL_FEE_REQUIRED", "Protocol fee payment is required first.")
  }
  if (vouch.appointmentAt <= new Date()) {
    await prisma.vouch.updateMany({
      where: { id: vouch.id, capturedAt: null, expiredAt: null },
      data: { status: "expired", expiredAt: new Date() },
    })
    return actionSuccess({ vouchId, checkoutUrl: null })
  }

  const existing = vouch.paymentIntents[0]
  if (existing?.stripeCheckoutSessionUrl) {
    return actionSuccess({ vouchId, checkoutUrl: existing.stripeCheckoutSessionUrl })
  }

  const connectedAccount = vouch.merchant.connectedAccount
  if (
    !connectedAccount?.stripeAccountId ||
    !connectedAccount.chargesEnabled ||
    !connectedAccount.payoutsEnabled ||
    !connectedAccount.detailsSubmitted
  ) {
    return actionFailure("READINESS_BLOCKED", "Connected account readiness is incomplete.")
  }

  const pricing = calculatePricing(vouch.amountCents)
  const appUrl = getAppUrl()
  const checkout = await createStripeCheckoutAuthorization({
    vouchId,
    pricing,
    currency: vouch.currency,
    connectedAccountId: connectedAccount.stripeAccountId,
    expiresAt: vouch.appointmentAt,
    successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/vouches/${vouchId}?deposit_authorization=cancelled`,
    idempotencyKey: `vouch:${vouchId}:customer-authorization-checkout`,
  })

  const paymentIntentId = getStripeId(checkout.payment_intent)
  const checkoutUrl = checkout.url ?? null

  await prisma.$transaction(async (tx) => {
    await tx.paymentIntentRecord.upsert({
      where: { stripeCheckoutSessionId: checkout.id },
      create: {
        vouchId,
        purpose: "customer_deposit_authorization",
        participantRole: "customer",
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        stripeCheckoutSessionId: checkout.id,
        stripeCheckoutSessionUrl: checkoutUrl,
        stripeAccountId: connectedAccount.stripeAccountId,
        amountCents: pricing.protectedAmountCents,
        currency: vouch.currency,
        status: "requires_payment_method",
        captureMethod: "manual",
      },
      update: {
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        stripeCheckoutSessionUrl: checkoutUrl,
        stripeAccountId: connectedAccount.stripeAccountId,
        amountCents: pricing.protectedAmountCents,
        currency: vouch.currency,
        status: "requires_payment_method",
        captureMethod: "manual",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.customer_authorization_checkout_created",
        actorType: "stripe",
        entityType: "Vouch",
        entityId: vouchId,
        metadata: {
          stripe_checkout_session_id: checkout.id,
          stripe_payment_intent_id: paymentIntentId,
          stripe_account_id: connectedAccount.stripeAccountId,
        },
      },
    })
  })

  revalidateVouchSurfaces(vouchId)

  return actionSuccess({ vouchId, checkoutUrl })
}

export async function markProtocolFeePaidAndIssueAuthorizationCheckout(input: {
  vouchId: string
  stripeCheckoutSessionId: string
  stripePaymentIntentId?: string | undefined
  amountCents?: number | undefined
  currency?: string | undefined
}): Promise<ActionResult<CustomerAuthorizationCheckoutResult>> {
  const transition = await prisma.$transaction(async (tx) => {
    const now = new Date()
    const vouch = await tx.vouch.findUnique({
      where: { id: input.vouchId },
      select: {
        id: true,
        amountCents: true,
        currency: true,
        protocolFeePaidAt: true,
        status: true,
      },
    })
    if (!vouch) return "not_found" as const

    const expectedFeeCents = calculatePricing(vouch.amountCents).vouchServiceFeeCents
    if (input.amountCents !== expectedFeeCents || input.currency !== vouch.currency) {
      return "payment_mismatch" as const
    }

    const updated = await tx.vouch.updateMany({
      where: {
        id: input.vouchId,
        protocolFeePaidAt: null,
        status: "draft",
      },
      data: {
        protocolFeePaidAt: now,
        status: "protocol_fee_paid",
      },
    })
    if (updated.count === 0) {
      return vouch.protocolFeePaidAt ? ("already_paid" as const) : ("invalid_state" as const)
    }

    await tx.paymentIntentRecord.upsert({
      where: { stripeCheckoutSessionId: input.stripeCheckoutSessionId },
      create: {
        vouchId: input.vouchId,
        purpose: "merchant_protocol_fee",
        participantRole: "merchant",
        ...(input.stripePaymentIntentId
          ? { stripePaymentIntentId: input.stripePaymentIntentId }
          : {}),
        stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        amountCents: input.amountCents ?? 0,
        currency: input.currency ?? "usd",
        status: "succeeded",
        captureMethod: "automatic",
        succeededAt: now,
        syncedAt: now,
      },
      update: {
        ...(input.stripePaymentIntentId
          ? { stripePaymentIntentId: input.stripePaymentIntentId }
          : {}),
        ...(input.amountCents !== undefined ? { amountCents: input.amountCents } : {}),
        ...(input.currency ? { currency: input.currency } : {}),
        status: "succeeded",
        succeededAt: now,
        syncedAt: now,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.protocol_fee_paid",
        actorType: "stripe",
        entityType: "Vouch",
        entityId: input.vouchId,
        metadata: {
          stripe_checkout_session_id: input.stripeCheckoutSessionId,
          stripe_payment_intent_id: input.stripePaymentIntentId,
        },
      },
    })
    return "paid" as const
  })

  if (transition === "not_found") return actionFailure("NOT_FOUND", "Vouch not found.")
  if (transition === "payment_mismatch") {
    return actionFailure("PAYMENT_MISMATCH", "Protocol fee payment did not match the Vouch.")
  }
  if (transition === "invalid_state") {
    return actionFailure("INVALID_STATE", "Vouch cannot accept a protocol fee payment.")
  }

  return ensureCustomerAuthorizationCheckoutForVouch(input.vouchId)
}

export async function markCustomerDepositAuthorized(input: {
  vouchId: string
  stripeCheckoutSessionId: string
  stripePaymentIntentId?: string | undefined
  stripeCustomerId?: string | undefined
  stripeAccountId?: string | undefined
  amountCents?: number | undefined
  currency?: string | undefined
}): Promise<ActionResult<{ vouchId: string }>> {
  const vouch = await prisma.vouch.findUnique({
    where: { id: input.vouchId },
    select: {
      appointmentAt: true,
      amountCents: true,
      currency: true,
      merchant: { select: { connectedAccount: { select: { stripeAccountId: true } } } },
      paymentIntents: {
        where: {
          purpose: "customer_deposit_authorization",
          stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        },
        take: 1,
        select: { id: true, stripePaymentIntentId: true, stripeAccountId: true },
      },
    },
  })
  const now = new Date()

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  const paymentRecord = vouch.paymentIntents[0]
  const canonicalAccountId = vouch.merchant.connectedAccount?.stripeAccountId
  if (
    !input.stripePaymentIntentId ||
    !input.stripeAccountId ||
    input.amountCents !== vouch.amountCents ||
    input.currency !== vouch.currency ||
    !paymentRecord ||
    paymentRecord.stripeAccountId !== input.stripeAccountId ||
    canonicalAccountId !== input.stripeAccountId ||
    (paymentRecord.stripePaymentIntentId &&
      paymentRecord.stripePaymentIntentId !== input.stripePaymentIntentId)
  ) {
    return actionFailure(
      "AUTHORIZATION_MISMATCH",
      "Customer authorization did not match the canonical Vouch payment."
    )
  }

  if (vouch.appointmentAt <= now && input.stripePaymentIntentId && input.stripeAccountId) {
    await cancelStripeAuthorization({
      providerPaymentIntentId: input.stripePaymentIntentId,
      connectedAccountId: input.stripeAccountId,
      idempotencyKey: `vouch:${input.vouchId}:late-authorization-cancel`,
    })
    await prisma.$transaction(async (tx) => {
      await tx.paymentIntentRecord.updateMany({
        where: {
          vouchId: input.vouchId,
          stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        },
        data: { status: "canceled", canceledAt: now, syncedAt: now },
      })
      await tx.vouch.updateMany({
        where: { id: input.vouchId, capturedAt: null },
        data: { status: "expired", expiredAt: now, voidedAt: now },
      })
      await tx.auditEvent.create({
        data: {
          eventName: "vouch.late_authorization_canceled",
          actorType: "stripe",
          entityType: "Vouch",
          entityId: input.vouchId,
        },
      })
    })
    return actionSuccess({ vouchId: input.vouchId })
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentIntentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        stripePaymentIntentId: input.stripePaymentIntentId!,
        ...(input.stripeCustomerId ? { stripeCustomerId: input.stripeCustomerId } : {}),
        stripeAccountId: input.stripeAccountId!,
        amountCents: input.amountCents!,
        currency: input.currency!,
        status: "requires_capture",
        captureMethod: "manual",
        authorizedAt: now,
        syncedAt: now,
      },
    })

    await tx.vouch.updateMany({
      where: {
        id: input.vouchId,
        status: "protocol_fee_paid",
        authorizedAt: null,
      },
      data: {
        status: "authorized",
        authorizedAt: now,
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.customer_deposit_authorized",
        actorType: "stripe",
        entityType: "Vouch",
        entityId: input.vouchId,
        metadata: {
          stripe_checkout_session_id: input.stripeCheckoutSessionId,
          stripe_payment_intent_id: input.stripePaymentIntentId,
          stripe_account_id: input.stripeAccountId,
        },
      },
    })
  })

  revalidateVouchSurfaces(input.vouchId)

  return actionSuccess({ vouchId: input.vouchId })
}

export async function claimCustomerAuthorizationCheckout(input: {
  checkoutSessionId: string
  revalidate?: boolean
}): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const checkoutSessionId = input.checkoutSessionId.trim()

  if (!checkoutSessionId.startsWith("cs_")) {
    return actionFailure("INVALID_CHECKOUT_SESSION", "Checkout session is not valid.")
  }

  const paymentRecord = await prisma.paymentIntentRecord.findUnique({
    where: { stripeCheckoutSessionId: checkoutSessionId },
    select: {
      id: true,
      vouchId: true,
      stripeAccountId: true,
      stripePaymentIntentId: true,
      amountCents: true,
      currency: true,
      purpose: true,
      vouch: {
        select: {
          customerId: true,
          merchantId: true,
          appointmentAt: true,
        },
      },
    },
  })

  if (
    !paymentRecord?.vouchId ||
    !paymentRecord.stripeAccountId ||
    paymentRecord.purpose !== "customer_deposit_authorization" ||
    !paymentRecord.vouch
  ) {
    return actionFailure("CHECKOUT_NOT_FOUND", "Checkout session could not be verified.")
  }

  if (paymentRecord.vouch.merchantId === user.id) {
    return actionFailure("VOUCH_ACCEPTANCE_CONFLICT", "The merchant cannot claim this Vouch.")
  }
  if (paymentRecord.vouch.customerId && paymentRecord.vouch.customerId !== user.id) {
    return actionFailure("VOUCH_ACCEPTANCE_CONFLICT", "This Vouch has already been claimed.")
  }

  const session = await retrieveStripeAuthorizationCheckout({
    checkoutSessionId,
    connectedAccountId: paymentRecord.stripeAccountId,
  })
  const paymentIntent =
    session.payment_intent && typeof session.payment_intent !== "string"
      ? session.payment_intent
      : null
  const stripeCustomerId = getStripeId(session.customer)

  if (
    session.status !== "complete" ||
    session.metadata?.payment_role !== "customer_commitment" ||
    session.metadata.vouch_id !== paymentRecord.vouchId ||
    paymentIntent?.status !== "requires_capture" ||
    (paymentRecord.stripePaymentIntentId &&
      paymentRecord.stripePaymentIntentId !== paymentIntent.id) ||
    session.amount_total !== paymentRecord.amountCents ||
    session.currency !== paymentRecord.currency ||
    !stripeCustomerId
  ) {
    return actionFailure("CHECKOUT_NOT_COMPLETE", "Checkout authorization is not complete.")
  }
  if (paymentRecord.vouch.appointmentAt <= new Date()) {
    await markCustomerDepositAuthorized({
      vouchId: paymentRecord.vouchId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      stripeAccountId: paymentRecord.stripeAccountId,
      amountCents: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
    })
    return actionFailure(
      "AUTHORIZATION_DEADLINE_PASSED",
      "The customer authorization deadline has passed."
    )
  }

  const now = new Date()
  const claimedNow = !paymentRecord.vouch.customerId
  await prisma.$transaction(async (tx) => {
    if (claimedNow) {
      await bindCustomerToVouchTx(tx, {
        vouchId: paymentRecord.vouchId!,
        customerId: user.id,
      })
    }

    await tx.paymentIntentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId,
        status: "requires_capture",
        captureMethod: "manual",
        captureBefore: getCaptureBefore(paymentIntent),
        authorizedAt: now,
        syncedAt: now,
      },
    })

    await tx.vouch.updateMany({
      where: { id: paymentRecord.vouchId!, status: "protocol_fee_paid" },
      data: { status: "authorized", authorizedAt: now },
    })

    if (claimedNow) {
      await tx.auditEvent.create({
        data: {
          eventName: "vouch.customer_claimed",
          actorType: "user",
          actorUserId: user.id,
          entityType: "Vouch",
          entityId: paymentRecord.vouchId!,
          metadata: {
            stripe_checkout_session_id: session.id,
            stripe_account_id: paymentRecord.stripeAccountId,
          },
        },
      })
    }
  })

  if (input.revalidate !== false) {
    revalidateVouchSurfaces(paymentRecord.vouchId)
  }
  return actionSuccess({ vouchId: paymentRecord.vouchId })
}

export async function getCustomerAuthorizationCheckoutForAuthenticatedUser(input: {
  publicId: string
}): Promise<ActionResult<{ checkoutUrl: string }>> {
  const user = await requireActiveUser()
  const publicId = input.publicId.trim()

  const vouch = await prisma.vouch.findUnique({
    where: { publicId },
    select: {
      merchantId: true,
      customerId: true,
      appointmentAt: true,
      status: true,
      paymentIntents: {
        where: { purpose: "customer_deposit_authorization" },
        take: 1,
        select: { stripeCheckoutSessionUrl: true },
      },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.merchantId === user.id) {
    return actionFailure("VOUCH_ACCEPTANCE_CONFLICT", "The merchant cannot accept this Vouch.")
  }
  if (vouch.customerId && vouch.customerId !== user.id) {
    return actionFailure("VOUCH_ACCEPTANCE_CONFLICT", "This Vouch has already been claimed.")
  }
  if (vouch.appointmentAt <= new Date()) {
    return actionFailure("AUTHORIZATION_DEADLINE_PASSED", "The authorization deadline has passed.")
  }
  if (vouch.status !== "protocol_fee_paid") {
    return actionFailure(
      "VOUCH_NOT_ACCEPTABLE",
      "This Vouch is not awaiting customer authorization."
    )
  }

  const checkoutUrl = vouch.paymentIntents[0]?.stripeCheckoutSessionUrl
  if (!checkoutUrl) {
    return actionFailure("CHECKOUT_NOT_FOUND", "Customer authorization Checkout is unavailable.")
  }

  return actionSuccess({ checkoutUrl })
}

export async function confirmPresence(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = confirmPresenceSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the confirmation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await getVouchParticipantActionState(parsed.data.vouchId)

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: vouch.merchantId,
    customerId: vouch.customerId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")
  if (!vouch.customerId) return actionFailure("CUSTOMER_REQUIRED", "Customer is required.")

  const counterpartyRole = participantRole === "merchant" ? "customer" : "merchant"
  const counterpartyUserId = participantRole === "merchant" ? vouch.customerId : vouch.merchantId
  const validCode = verifyConfirmationCode({
    vouchId: vouch.id,
    publicId: vouch.publicId,
    participantRole: counterpartyRole,
    participantUserId: counterpartyUserId,
    submittedCode: parsed.data.submittedCode,
    allowedBucketSkew: 0,
  })

  if (!validCode) {
    return actionFailure("INVALID_CONFIRMATION_CODE", "Confirmation code is not valid.")
  }

  let shouldCapture = false

  try {
    await prisma.$transaction(async (tx) => {
      await createPresenceConfirmationTx(tx, {
        vouchId: parsed.data.vouchId,
        userId: user.id,
        participantRole,
        method: parsed.data.method,
        serverReceivedAt: new Date(),
      })

      const aggregateStatus = await getAggregateConfirmationStatusTx(tx, {
        vouchId: parsed.data.vouchId,
      })
      shouldCapture = aggregateStatus === "both_confirmed"

      if (shouldCapture) {
        await tx.vouch.updateMany({
          where: { id: parsed.data.vouchId, status: "authorized" },
          data: { status: "can_capture" },
        })
      }

      await tx.auditEvent.create({
        data: {
          eventName: "vouch.presence_confirmed",
          actorType: "user",
          actorUserId: user.id,
          entityType: "Vouch",
          entityId: parsed.data.vouchId,
          metadata: {
            participant_role: participantRole,
            aggregate_status: aggregateStatus,
          },
        },
      })
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "DUPLICATE_PRESENCE_CONFIRMATION":
          return actionFailure("DUPLICATE_CONFIRMATION", "This participant already confirmed.")
        case "CONFIRMATION_WINDOW_NOT_OPEN":
          return actionFailure("CONFIRMATION_WINDOW_NOT_OPEN", "Confirmation is not open yet.")
        case "CONFIRMATION_WINDOW_CLOSED":
          return actionFailure("CONFIRMATION_WINDOW_CLOSED", "Confirmation window has closed.")
        case "UNAUTHORIZED_CONFIRMATION_PARTICIPANT":
          return actionFailure("AUTHZ_DENIED", "Participant access required.")
        case "VOUCH_NOT_CONFIRMABLE":
          return actionFailure("INVALID_VOUCH_STATE", "This Vouch is not confirmable.")
      }
    }
    throw error
  }

  if (shouldCapture) {
    await captureCustomerDepositForVouch(parsed.data.vouchId)
  }

  revalidateVouchSurfaces(parsed.data.vouchId)
  return actionSuccess({ vouchId: parsed.data.vouchId })
}

export async function confirmPresenceFormAction(formData: FormData): Promise<void> {
  await confirmPresence({
    vouchId: String(formData.get("vouchId") ?? ""),
    submittedCode: String(formData.get("submittedCode") ?? ""),
    method: "code_exchange",
  })
}

export async function archiveVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = archiveVouchSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the Vouch ID.", getFieldErrors(parsed.error))
  }

  const vouch = await getVouchParticipantActionState(parsed.data.vouchId)

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: vouch.merchantId,
    customerId: vouch.customerId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")

  await prisma.$transaction(async (tx) => {
    await updateVouchArchiveStatusTx(tx, {
      vouchId: parsed.data.vouchId,
      archiveStatus: "archived",
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.archived",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: parsed.data.vouchId,
      },
    })
  })

  revalidateVouchSurfaces(parsed.data.vouchId)
  return actionSuccess({ vouchId: parsed.data.vouchId })
}
