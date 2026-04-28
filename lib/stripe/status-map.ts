import "server-only"

import type Stripe from "stripe"

export type LocalPaymentStatus =
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

export type LocalRefundStatus = "not_required" | "pending" | "succeeded" | "failed"

export function mapStripePaymentIntentStatus(
  status: Stripe.PaymentIntent.Status
): LocalPaymentStatus {
  switch (status) {
    case "requires_payment_method":
      return "requires_payment_method"
    case "requires_confirmation":
    case "requires_action":
    case "processing":
      return "authorized"
    case "requires_capture":
      return "authorized"
    case "succeeded":
      return "captured"
    case "canceled":
      return "voided"
    default:
      return "failed"
  }
}

export function mapStripeRefundStatus(status: Stripe.Refund["status"] | null): LocalRefundStatus {
  switch (status) {
    case "pending":
      return "pending"
    case "succeeded":
      return "succeeded"
    case "failed":
    case "canceled":
      return "failed"
    default:
      return "pending"
  }
}

export function isTerminalStripePaymentIntentStatus(status: Stripe.PaymentIntent.Status): boolean {
  return status === "succeeded" || status === "canceled"
}
