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
