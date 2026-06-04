"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"
import {
  getCurrentUserConnectedAccount,
  getCurrentUserPaymentCustomer,
  requireActiveUser,
} from "@/lib/fetchers/authFetchers"
import {
  createStripeConnectAccount,
  createStripeConnectDashboardLink,
  createStripeConnectOnboardingLink,
  refreshStripeConnectReadiness,
} from "@/lib/integrations/stripe/connect"
import {
  createStripeCustomer,
  createStripeCustomerPortalSession,
  getStripeCustomerpaymentMethodReady,
} from "@/lib/integrations/stripe/customers"
import { createStripePaymentMethodSetupCheckout } from "@/lib/integrations/stripe/checkout-sessions"
import { syncPaymentCustomerReadinessForUser } from "@/lib/payments/stripeReadinessSync"

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

function revalidatePaymentSurfaces(): void {
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")
}

async function ensureStripeConnectedAccount(user: {
  id: string
  email: string | null
  displayName: string | null
}): Promise<string> {
  const existing = await getCurrentUserConnectedAccount()

  if (existing?.stripeAccountId) return existing.stripeAccountId

  const created = await createStripeConnectAccount({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    idempotencyKey: `user:${user.id}:connect_account`,
  })

  await prisma.connectedAccount.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeAccountId: created.providerAccountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      syncedAt: new Date(),
    },
    update: {
      stripeAccountId: created.providerAccountId,
      syncedAt: new Date(),
    },
  })

  return created.providerAccountId
}

async function ensureStripeCustomer(user: {
  id: string
  email: string | null
  displayName: string | null
}): Promise<string> {
  const existing = await getCurrentUserPaymentCustomer()

  if (existing?.stripeCustomerId) return existing.stripeCustomerId

  const created = await createStripeCustomer({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    idempotencyKey: `user:${user.id}:stripe_customer`,
  })

  await prisma.paymentCustomer.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeCustomerId: created.providerCustomerId,
      paymentMethodReady: false,
      syncedAt: new Date(),
    },
    update: {
      stripeCustomerId: created.providerCustomerId,
      syncedAt: new Date(),
    },
  })

  return created.providerCustomerId
}

export async function openStripeConnectDashboard(): Promise<never> {
  const user = await requireActiveUser()
  const stripeAccountId = await ensureStripeConnectedAccount(user)
  const readiness = await refreshStripeConnectReadiness({ providerAccountId: stripeAccountId })

  await prisma.connectedAccount.updateMany({
    where: { userId: user.id, stripeAccountId },
    data: {
      chargesEnabled: readiness.chargesEnabled,
      payoutsEnabled: readiness.payoutsEnabled,
      detailsSubmitted: readiness.detailsSubmitted,
      requirementsCurrentlyDue: readiness.requirementsCurrentlyDue,
      requirementsEventuallyDue: readiness.requirementsEventuallyDue,
      disabledReason: readiness.disabledReason,
      syncedAt: new Date(),
    },
  })

  revalidatePaymentSurfaces()

  if (readiness.readiness !== "ready") {
    const appUrl = getAppUrl()
    const link = await createStripeConnectOnboardingLink({
      providerAccountId: stripeAccountId,
      refreshUrl: `${appUrl}/dashboard`,
      returnUrl: `${appUrl}/dashboard?stripe_connect_return=1`,
    })
    redirect(link.url)
  }

  const link = await createStripeConnectDashboardLink({ providerAccountId: stripeAccountId })
  redirect(link.url)
}

export async function openStripePaymentMethodDashboard(): Promise<never> {
  const user = await requireActiveUser()
  const stripeCustomerId = await ensureStripeCustomer(user)
  await syncPaymentCustomerReadinessForUser({ userId: user.id, stripeCustomerId })
  const readiness = await getStripeCustomerpaymentMethodReady(stripeCustomerId)

  revalidatePaymentSurfaces()
  const appUrl = getAppUrl()

  if (readiness.readiness !== "ready") {
    const checkout = await createStripePaymentMethodSetupCheckout({
      userId: user.id,
      providerCustomerId: stripeCustomerId,
      successUrl: `${appUrl}/dashboard?stripe_payment_return=1`,
      cancelUrl: `${appUrl}/dashboard?stripe_payment_cancelled=1`,
      idempotencyKey: `user:${user.id}:payment-method-setup-checkout`,
    })
    redirect(checkout.url ?? "/dashboard")
  }

  const link = await createStripeCustomerPortalSession({
    providerCustomerId: stripeCustomerId,
    returnUrl: `${appUrl}/dashboard?stripe_payment_return=1`,
  })

  redirect(link.url)
}
