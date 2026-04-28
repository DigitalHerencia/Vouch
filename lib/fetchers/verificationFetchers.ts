import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  adultVerificationStateSelect,
  identityVerificationStateSelect,
  verificationStatusCardSelect,
  verificationStatusSelect,
} from "@/lib/db/selects/verification.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

function mapVerification(record) {
  return record
    ? {
        ...record,
        providerReference: record.providerReference
          ? `ref_${String(record.providerReference).slice(-6)}`
          : null,
        createdAt: iso(record.createdAt),
        updatedAt: iso(record.updatedAt),
      }
    : null
}

async function assertSelf(userId: string) {
  const current = await requireActiveUser()
  return current.id === userId
}

export async function getVerificationStatus(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapVerification(
    await prisma.verificationProfile.findUnique({
      where: { userId },
      select: verificationStatusSelect,
    })
  )
}

export async function getIdentityVerificationState(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapVerification(
    await prisma.verificationProfile.findUnique({
      where: { userId },
      select: identityVerificationStateSelect,
    })
  )
}

export async function getAdultVerificationState(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapVerification(
    await prisma.verificationProfile.findUnique({
      where: { userId },
      select: adultVerificationStateSelect,
    })
  )
}

export async function getVerificationProviderReturnState(input: {
  userId: string
  provider?: string | null
  status?: string | null
}) {
  const status = await getVerificationStatus(input.userId)

  return {
    variant: input.status === "success" ? "returned_success" : "returned_pending",
    provider: input.provider ?? "verification_provider",
    status,
  }
}

export async function getVerificationBlockedState(userId: string) {
  const status = await getVerificationStatus(userId)

  return {
    blocked: !status || status.identityStatus !== "verified" || status.adultStatus !== "verified",
    identityBlocked: status?.identityStatus !== "verified",
    adultBlocked: status?.adultStatus !== "verified",
    status,
  }
}

export async function getVerificationStatusCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapVerification(
    await prisma.verificationProfile.findUnique({
      where: { userId },
      select: verificationStatusCardSelect,
    })
  )
}
