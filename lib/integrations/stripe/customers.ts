import "server-only"

import { getStripeServerClient } from "./client"

export async function createStripeCustomer(input: {
  userId: string
  email?: string | null
  displayName?: string | null
  idempotencyKey: string
}): Promise<{ providerCustomerId: string }> {
  const customer = await getStripeServerClient().customers.create(
    {
      ...(input.email ? { email: input.email } : {}),
      ...(input.displayName ? { name: input.displayName } : {}),
      metadata: { vouch_user_id: input.userId },
    },
    { idempotencyKey: input.idempotencyKey }
  )

  return { providerCustomerId: customer.id }
}

export async function getStripeCustomerPaymentMethodReady(providerCustomerId: string): Promise<{
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

  // Setup-mode Checkout can save reusable methods such as Link as well as cards.
  // Any method attached to this platform Customer satisfies dashboard readiness.
  const paymentMethods = await stripe.paymentMethods.list({
    customer: providerCustomerId,
    limit: 1,
  })

  const fallbackPaymentMethodId = paymentMethods.data[0]?.id ?? null

  if (fallbackPaymentMethodId) {
    return { readiness: "ready", defaultPaymentMethodId: fallbackPaymentMethodId }
  }

  return { readiness: "requires_action", defaultPaymentMethodId: null }
}

export async function createStripeCustomerPortalSession(input: {
  providerCustomerId: string
  returnUrl: string
}): Promise<{ url: string }> {
  const session = await getStripeServerClient().billingPortal.sessions.create({
    customer: input.providerCustomerId,
    return_url: input.returnUrl,
  })

  return { url: session.url }
}
