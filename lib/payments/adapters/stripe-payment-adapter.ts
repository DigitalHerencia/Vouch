import "server-only"

import { prisma } from "@/lib/db/prisma"
import {
  captureStripePayment,
  createStripePaymentAuthorization,
  refundStripePayment,
  voidStripeAuthorization,
} from "@/lib/integrations/stripe/payment-intents"

export type StripePaymentAdapterResult =
  | { ok: true; providerPaymentId: string; clientSecret?: string | null }
  | { ok: false; code: string; message: string }

export type InitializeStripePaymentInput = {
  vouchId: string
  amountCents: number
  currency: string
  platformFeeCents: number
  providerCustomerId?: string
  providerPaymentMethodId?: string
  connectedAccountId?: string
  confirmOffSession?: boolean
  idempotencyKey?: string
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
      amountCents: input.amountCents,
      currency: input.currency,
      platformFeeCents: input.platformFeeCents,
      ...(input.providerCustomerId ? { providerCustomerId: input.providerCustomerId } : {}),
      ...(input.providerPaymentMethodId
        ? { providerPaymentMethodId: input.providerPaymentMethodId }
        : {}),
      ...(input.connectedAccountId ? { connectedAccountId: input.connectedAccountId } : {}),
      ...(input.confirmOffSession ? { confirmOffSession: input.confirmOffSession } : {}),
      idempotencyKey: input.idempotencyKey ?? `vouch:${input.vouchId}:payment_authorization`,
    })

    await prisma.paymentRecord.upsert({
      where: { vouchId: input.vouchId },
      create: {
        vouchId: input.vouchId,
        provider: "stripe",
        providerPaymentId: paymentIntent.id,
        status: paymentIntent.status === "requires_capture" ? "authorized" : "requires_payment_method",
        amountCents: input.amountCents,
        currency: input.currency,
        platformFeeCents: input.platformFeeCents,
      },
      update: {
        providerPaymentId: paymentIntent.id,
        status: paymentIntent.status === "requires_capture" ? "authorized" : "requires_payment_method",
        amountCents: input.amountCents,
        currency: input.currency,
        platformFeeCents: input.platformFeeCents,
        lastErrorCode: null,
        lastErrorMessage: null,
      },
    })

    if (
      !["requires_capture", "requires_payment_method", "requires_confirmation"].includes(
        paymentIntent.status
      )
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
      vouch: {
        select: {
          id: true,
          payee: {
            select: {
              connectedAccount: {
                select: { providerAccountId: true, readiness: true, payoutsEnabled: true },
              },
            },
          },
        },
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

  if (paymentRecord.status !== "authorized") {
    return {
      ok: false,
      code: "PAYMENT_NOT_AUTHORIZED",
      message: "Payment must be provider-authorized before release.",
    }
  }

  const connectedAccountId =
    input.connectedAccountId ?? paymentRecord.vouch.payee?.connectedAccount?.providerAccountId

  if (!connectedAccountId) {
    return {
      ok: false,
      code: "CONNECTED_ACCOUNT_REQUIRED",
      message: "Payee payout account is required.",
    }
  }

  try {
    const captured = await captureStripePayment({
      providerPaymentId: paymentRecord.providerPaymentId,
      idempotencyKey: input.idempotencyKey ?? `payment:${paymentRecord.id}:capture`,
    })

    const providerChargeId =
      typeof captured.latest_charge === "string" ? captured.latest_charge : null

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
      status: true,
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
    if (paymentRecord.status === "authorized") {
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
            amountCents: paymentRecord.amountCents,
          },
          update: { status: "succeeded", reason: input.reason },
        }),
      ])
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
          amountCents: paymentRecord.amountCents,
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
