import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  connectedAccountReadinessSelect,
  paymentCustomerReadinessSelect,
  paymentRecordParticipantSummarySelect,
  refundRecordParticipantSummarySelect,
} from "@/lib/db/selects/payment.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

type PaymentReadRecord = Record<string, unknown> & {
  providerCustomerId?: string | null
  providerAccountId?: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
}

function mapRecord<T extends PaymentReadRecord | null>(record: T) {
  if (!record) return null

  return {
    ...record,
    providerCustomerId: record.providerCustomerId
      ? `cus_${String(record.providerCustomerId).slice(-6)}`
      : undefined,
    providerAccountId: record.providerAccountId
      ? `acct_${String(record.providerAccountId).slice(-6)}`
      : undefined,
    createdAt: iso(record.createdAt),
    updatedAt: iso(record.updatedAt),
  }
}

async function assertSelf(userId: string) {
  const current = await requireActiveUser()
  return current.id === userId
}

export async function getPaymentMethodReadiness(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  const customer = await prisma.paymentCustomer.findUnique({
    where: { userId },
    select: paymentCustomerReadinessSelect,
  })

  return {
    userId,
    readiness: customer?.readiness ?? "not_started",
    customer: mapRecord(customer),
  }
}

export async function getPaymentReadiness(userId: string) {
  return getPaymentMethodReadiness(userId)
}

export async function getPaymentSettingsPageState(userId: string) {
  const readiness = await getPaymentMethodReadiness(userId)
  return {
    variant: readiness?.readiness === "ready" ? "ready" : "setup_required",
    readiness,
  }
}

export async function getPaymentMethodSetupState(userId: string) {
  const readiness = await getPaymentMethodReadiness(userId)
  return { variant: "setup", readiness }
}

export async function getPaymentMethodProviderRedirectState(input: {
  userId: string
  returnUrl?: string | null
}) {
  return {
    variant: "provider_redirect",
    returnUrl: input.returnUrl ?? "/dashboard",
    readiness: await getPaymentMethodReadiness(input.userId),
  }
}

export async function getPaymentMethodReadyState(userId: string) {
  return { variant: "ready", readiness: await getPaymentMethodReadiness(userId) }
}

export async function getPaymentMethodFailedState(userId: string) {
  return { variant: "failed", readiness: await getPaymentMethodReadiness(userId) }
}

export async function getPayoutReadiness(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  const account = await prisma.connectedAccount.findUnique({
    where: { userId },
    select: connectedAccountReadinessSelect,
  })

  return {
    userId,
    readiness: account?.readiness ?? "not_started",
    connectedAccount: mapRecord(account),
  }
}

export async function getPayoutSettingsPageState(userId: string) {
  const readiness = await getPayoutReadiness(userId)
  return {
    variant: readiness?.readiness === "ready" ? "ready" : "setup_required",
    readiness,
  }
}

export async function getPayoutSetupState(userId: string) {
  return { variant: "setup", readiness: await getPayoutReadiness(userId) }
}

export async function getPayoutProviderRedirectState(input: {
  userId: string
  returnUrl?: string | null
}) {
  return {
    variant: "provider_redirect",
    returnUrl: input.returnUrl ?? "/dashboard",
    readiness: await getPayoutReadiness(input.userId),
  }
}

export async function getPayoutReadyState(userId: string) {
  return { variant: "ready", readiness: await getPayoutReadiness(userId) }
}

export async function getPayoutRestrictedState(userId: string) {
  return { variant: "restricted", readiness: await getPayoutReadiness(userId) }
}

export async function getPayoutSetupFailedState(userId: string) {
  return { variant: "failed", readiness: await getPayoutReadiness(userId) }
}

async function assertParticipantForVouch(vouchId: string) {
  const current = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ merchantId: current.id }, { customerId: current.id }],
    },
    select: { id: true },
  })

  return Boolean(vouch)
}

export async function getParticipantSafePaymentSummary(vouchId: string) {
  noStore()
  if (!(await assertParticipantForVouch(vouchId))) return null

  return mapRecord(
    await prisma.paymentRecord.findUnique({
      where: { vouchId },
      select: paymentRecordParticipantSummarySelect,
    })
  )
}

export async function getParticipantSafeRefundSummary(vouchId: string) {
  noStore()
  if (!(await assertParticipantForVouch(vouchId))) return null

  return mapRecord(
    await prisma.refundRecord.findFirst({
      where: { vouchId },
      select: refundRecordParticipantSummarySelect,
    })
  )
}

export async function getPaymentStatusCard(vouchId: string) {
  return getParticipantSafePaymentSummary(vouchId)
}

export async function getRefundStatusCard(vouchId: string) {
  return getParticipantSafeRefundSummary(vouchId)
}

export async function getProviderUnavailableState() {
  return {
    variant: "provider_unavailable",
    title: "Payment provider unavailable",
    message:
      "Payment setup or resolution is temporarily unavailable. No funds were released by this state.",
  }
}
