"use server"

import { randomUUID } from "node:crypto"

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
import { createStripeCustomer } from "@/lib/integrations/stripe/customers"
import { createStripePaymentMethodSetupCheckout } from "@/lib/integrations/stripe/checkout-sessions"
import { syncPaymentCustomerReadinessForUser } from "@/lib/payments/stripeReadinessSync"

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

function getReturnPath(formData: FormData | undefined, fallback: "/dashboard" | "/vouches/new") {
  const raw = formData?.get("returnPath")

  if (typeof raw !== "string") return fallback
  if (raw === "/dashboard" || raw === "/vouches/new") return raw

  return fallback
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

export async function openStripeConnectDashboard(formData?: FormData): Promise<never> {
  const user = await requireActiveUser()
  const returnPath = getReturnPath(formData, "/dashboard")
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
      refreshUrl: `${appUrl}${returnPath}`,
      returnUrl: `${appUrl}${returnPath}?stripe_connect_return=1`,
    })
    redirect(link.url)
  }

  const link = await createStripeConnectDashboardLink({ providerAccountId: stripeAccountId })
  redirect(link.url)
}

export async function openStripePaymentMethodSetup(formData?: FormData): Promise<never> {
  const user = await requireActiveUser()
  const returnPath = getReturnPath(formData, "/dashboard")
  const stripeCustomerId = await ensureStripeCustomer(user)
  await syncPaymentCustomerReadinessForUser({ userId: user.id, stripeCustomerId })

  revalidatePaymentSurfaces()
  const appUrl = getAppUrl()

  const checkout = await createStripePaymentMethodSetupCheckout({
    userId: user.id,
    providerCustomerId: stripeCustomerId,
    currency: "usd",
    successUrl: `${appUrl}${returnPath}?stripe_payment_return=1`,
    cancelUrl: `${appUrl}${returnPath}?stripe_payment_cancelled=1`,
    idempotencyKey: `user:${user.id}:payment-method-setup-checkout:${randomUUID()}`,
  })

  redirect(checkout.url ?? "/dashboard")
}
