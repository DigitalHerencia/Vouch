import "server-only"

import type Stripe from "stripe"

import type { PaymentStatus, RefundStatus } from "@/types/paymentTypes"

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
