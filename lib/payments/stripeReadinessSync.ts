import "server-only"

import { prisma } from "@/lib/db/prisma"
import { refreshStripeConnectReadiness } from "@/lib/integrations/stripe/connect"
import { getStripeCustomerPaymentMethodReady } from "@/lib/integrations/stripe/customers"

export async function syncConnectedAccountReadinessForUser(input: {
  userId: string
  stripeAccountId: string
  stripeEventId?: string
}): Promise<void> {
  const readiness = await refreshStripeConnectReadiness({
    providerAccountId: input.stripeAccountId,
  })

  await prisma.connectedAccount.updateMany({
    where: { userId: input.userId, stripeAccountId: input.stripeAccountId },
    data: {
      chargesEnabled: readiness.chargesEnabled,
      payoutsEnabled: readiness.payoutsEnabled,
      detailsSubmitted: readiness.detailsSubmitted,
      requirementsCurrentlyDue: readiness.requirementsCurrentlyDue,
      requirementsEventuallyDue: readiness.requirementsEventuallyDue,
      disabledReason: readiness.disabledReason,
      ...(input.stripeEventId ? { lastStripeEventId: input.stripeEventId } : {}),
      syncedAt: new Date(),
    },
  })
}

export async function syncPaymentCustomerReadinessForUser(input: {
  userId: string
  stripeCustomerId: string
  stripeEventId?: string
  setupIntentId?: string | null
}): Promise<void> {
  const readiness = await getStripeCustomerPaymentMethodReady(input.stripeCustomerId)

  await prisma.paymentCustomer.updateMany({
    where: { userId: input.userId, stripeCustomerId: input.stripeCustomerId },
    data: {
      paymentMethodReady: readiness.readiness === "ready",
      defaultPaymentMethodId: readiness.defaultPaymentMethodId,
      ...(input.setupIntentId ? { lastSetupIntentId: input.setupIntentId } : {}),
      ...(input.stripeEventId ? { lastStripeEventId: input.stripeEventId } : {}),
      syncedAt: new Date(),
    },
  })
}
