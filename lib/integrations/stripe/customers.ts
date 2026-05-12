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

export async function createStripeSetupIntent(input: {
  providerCustomerId: string
  userId: string
  idempotencyKey: string
}): Promise<{ id: string; clientSecret: string | null }> {
  const setupIntent = await getStripeServerClient().setupIntents.create(
    {
      customer: input.providerCustomerId,
      usage: "off_session",
      metadata: { vouch_user_id: input.userId },
    },
    { idempotencyKey: input.idempotencyKey }
  )

  return { id: setupIntent.id, clientSecret: setupIntent.client_secret }
}

export async function retrieveStripeSetupIntent(input: { setupIntentId: string }): Promise<{
  status: string
  providerCustomerId: string | null
  providerPaymentMethodId: string | null
}> {
  const setupIntent = await getStripeServerClient().setupIntents.retrieve(input.setupIntentId)

  return {
    status: setupIntent.status,
    providerCustomerId:
      setupIntent.customer && typeof setupIntent.customer === "string"
        ? setupIntent.customer
        : null,
    providerPaymentMethodId:
      setupIntent.payment_method && typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : null,
  }
}

export async function setStripeCustomerDefaultPaymentMethod(input: {
  providerCustomerId: string
  providerPaymentMethodId: string
}): Promise<void> {
  await getStripeServerClient().customers.update(input.providerCustomerId, {
    invoice_settings: { default_payment_method: input.providerPaymentMethodId },
  })
}

export async function getStripeCustomerPaymentReadiness(providerCustomerId: string): Promise<{
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
