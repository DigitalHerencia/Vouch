import "server-only"

import { prisma } from "@/lib/db/prisma"
import { getStripeClient } from "@/lib/stripe/client"

export type StripePaymentAdapterResult =
  | { ok: true; providerPaymentId: string; clientSecret?: string | null }
  | { ok: false; code: string; message: string }

export type InitializeStripePaymentInput = {
  vouchId: string
  amountCents: number
  currency: string
  platformFeeCents: number
  providerCustomerId?: string
}

export async function initializeStripePaymentForVouch(
  input: InitializeStripePaymentInput
): Promise<StripePaymentAdapterResult> {
  const stripe = getStripeClient()

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amountCents + input.platformFeeCents,
      currency: input.currency,
      capture_method: "manual",
      ...(input.providerCustomerId ? { customer: input.providerCustomerId } : {}),
      metadata: {
        vouch_id: input.vouchId,
        payment_role: "payer_commitment",
      },
    })

    await prisma.paymentRecord.upsert({
      where: { vouchId: input.vouchId },
      create: {
        vouchId: input.vouchId,
        provider: "stripe",
        providerPaymentId: paymentIntent.id,
        status: "authorized",
        amountCents: input.amountCents,
        currency: input.currency,
        platformFeeCents: input.platformFeeCents,
      },
      update: {
        providerPaymentId: paymentIntent.id,
        status: "authorized",
        amountCents: input.amountCents,
        currency: input.currency,
        platformFeeCents: input.platformFeeCents,
        lastErrorCode: null,
      },
    })

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
}

export async function releaseStripePaymentForCompletedVouch(
  input: ReleaseStripePaymentInput
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const stripe = getStripeClient()

  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { id: input.paymentRecordId },
    select: {
      id: true,
      providerPaymentId: true,
      amountCents: true,
      platformFeeCents: true,
      currency: true,
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
    return { ok: false, code: "PAYMENT_RECORD_NOT_READY", message: "No provider payment ID exists." }
  }

  const connectedAccountId =
    input.connectedAccountId ?? paymentRecord.vouch.payee?.connectedAccount?.providerAccountId

  if (!connectedAccountId) {
    return { ok: false, code: "CONNECTED_ACCOUNT_REQUIRED", message: "Payee payout account is required." }
  }

  try {
    const captured = await stripe.paymentIntents.capture(paymentRecord.providerPaymentId, {
      application_fee_amount: paymentRecord.platformFeeCents,
      transfer_data: {
        destination: connectedAccountId,
      },
    })

    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: captured.status === "succeeded" ? "released" : "release_pending",
        providerChargeId: typeof captured.latest_charge === "string" ? captured.latest_charge : null,
        lastErrorCode: null,
      },
    })

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe payment release failed."
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: { status: "failed", lastErrorCode: "STRIPE_RELEASE_FAILED" },
    })
    return { ok: false, code: "STRIPE_RELEASE_FAILED", message }
  }
}

export async function refundOrVoidStripePaymentForVouch(input: {
  paymentRecordId: string
  reason: "not_accepted" | "confirmation_incomplete" | "canceled_before_acceptance" | "payment_failure" | "provider_required"
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const stripe = getStripeClient()
  const paymentRecord = await prisma.paymentRecord.findUnique({
    where: { id: input.paymentRecordId },
    select: {
      id: true,
      vouchId: true,
      providerPaymentId: true,
      amountCents: true,
      status: true,
    },
  })

  if (!paymentRecord?.providerPaymentId) {
    return { ok: false, code: "PAYMENT_RECORD_NOT_READY", message: "No provider payment ID exists." }
  }

  try {
    if (paymentRecord.status === "authorized") {
      await stripe.paymentIntents.cancel(paymentRecord.providerPaymentId)
      await prisma.$transaction([
        prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: { status: "voided", lastErrorCode: null },
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

    const refund = await stripe.refunds.create({ payment_intent: paymentRecord.providerPaymentId })

    await prisma.$transaction([
      prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: { status: "refund_pending", lastErrorCode: null },
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
      data: { status: "failed", lastErrorCode: "STRIPE_REFUND_OR_VOID_FAILED" },
    })
    return { ok: false, code: "STRIPE_REFUND_OR_VOID_FAILED", message }
  }
}
