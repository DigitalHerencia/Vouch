import "server-only"

import type Stripe from "stripe"

import type {
  PaymentStatus,
  RefundStatus,
  SettlementStatus,
} from "@/prisma/generated/prisma/client"

export function mapStripePaymentIntentStatus(status: Stripe.PaymentIntent.Status): PaymentStatus {
  switch (status) {
    case "requires_payment_method":
      return "requires_payment_method"
    case "requires_confirmation":
      return "requires_confirmation"
    case "requires_action":
      return "requires_action"
    case "processing":
      return "processing"
    case "requires_capture":
      return "authorized"
    case "succeeded":
      return "captured"
    case "canceled":
      return "canceled"
    default:
      return "failed"
  }
}

export function mapStripePaymentIntentSettlementStatus(
  status: Stripe.PaymentIntent.Status
): SettlementStatus {
  switch (status) {
    case "requires_capture":
      return "pending"
    case "processing":
      return "capture_pending"
    case "succeeded":
      return "captured"
    case "canceled":
      return "non_captured"
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
      return "pending"
    default:
      return "failed"
  }
}

export function mapStripeRefundStatus(status: Stripe.Refund["status"] | null): RefundStatus {
  switch (status) {
    case "succeeded":
      return "succeeded"
    case "pending":
      return "pending"
    case "failed":
    case "canceled":
      return "failed"
    default:
      return "pending"
  }
}

export function isPaymentIntentCapturable(intent: Stripe.PaymentIntent): boolean {
  return intent.status === "requires_capture" && intent.amount_capturable > 0
}

export function getPaymentIntentCaptureBefore(intent: Stripe.PaymentIntent): Date | null {
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null
  const captureBefore = charge?.payment_method_details?.card?.capture_before

  return captureBefore ? new Date(captureBefore * 1000) : null
}

export function getPaymentIntentLatestChargeId(intent: Stripe.PaymentIntent): string | null {
  if (typeof intent.latest_charge === "string") return intent.latest_charge
  return intent.latest_charge?.id ?? null
}
