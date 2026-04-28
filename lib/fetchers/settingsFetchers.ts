import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  accountSettingsSelect,
  accountStatusCardSelect,
  paymentReadinessCardSelect,
  payoutReadinessCardSelect,
  privateAccountInfoSelect,
  profileBasicsSelect,
  termsStatusCardSelect,
  verificationStatusCardSelect,
} from "@/lib/db/selects/settings.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

function mapDates(record: any): any {
  if (!record || typeof record !== "object") return record
  if (Array.isArray(record)) return record.map(mapDates)

  const mapped: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(record)) {
    if (value instanceof Date) mapped[key] = iso(value)
    else if (Array.isArray(value)) mapped[key] = value.map(mapDates)
    else if (value && typeof value === "object") mapped[key] = mapDates(value)
    else mapped[key] = value
  }

  return mapped
}

async function assertSelf(userId: string) {
  const current = await requireActiveUser()
  return current.id === userId
}

export async function getAccountSettings(input?: { userId?: string }) {
  noStore()
  const current = await requireActiveUser()
  const userId = input?.userId ?? current.id
  if (current.id !== userId) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: accountSettingsSelect,
    })
  )
}

export async function getProfileBasics(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: profileBasicsSelect,
    })
  )
}

export async function getPrivateAccountInfo(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: privateAccountInfoSelect,
    })
  )
}

export async function getAccountStatusCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: accountStatusCardSelect,
    })
  )
}

export async function getVerificationStatusCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: verificationStatusCardSelect,
    })
  )
}

export async function getPaymentReadinessCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: paymentReadinessCardSelect,
    })
  )
}

export async function getPayoutReadinessCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: payoutReadinessCardSelect,
    })
  )
}

export async function getTermsStatusCard(userId: string) {
  noStore()
  if (!(await assertSelf(userId))) return null

  return mapDates(
    await prisma.user.findUnique({
      where: { id: userId },
      select: termsStatusCardSelect,
    })
  )
}

export async function getSettingsLoadingState() {
  return { variant: "loading", title: "Loading settings" }
}

export async function getSettingsErrorState(input: { message?: string }) {
  return {
    variant: "error",
    message: input.message ?? "Settings could not be loaded.",
  }
}
