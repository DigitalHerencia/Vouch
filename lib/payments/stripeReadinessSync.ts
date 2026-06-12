import "server-only"

import { prisma } from "@/lib/db/prisma"
import { refreshStripeConnectReadiness } from "@/lib/integrations/stripe/connect"

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
