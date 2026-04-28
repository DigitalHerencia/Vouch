import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser, requireUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  userAuthLookupSelect,
  userPrivateAccountSelect,
  userSafeIdentitySelect,
  userOperationalSnapshotSelect,
  userAccountStatusSelect,
} from "@/lib/db/selects/user.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

function mapUser(record: any) {
  return record
    ? {
        ...record,
        createdAt: iso(record.createdAt),
        updatedAt: iso(record.updatedAt),
      }
    : null
}

export async function getUserById(userId: string) {
  noStore()
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  return mapUser(
    await prisma.user.findUnique({
      where: { id: userId },
      select: userPrivateAccountSelect,
    })
  )
}

export async function getUserByClerkUserId(clerkUserId: string) {
  noStore()
  const current = await requireActiveUser()
  if (current.clerkUserId !== clerkUserId) return null

  return mapUser(
    await prisma.user.findUnique({
      where: { clerkUserId },
      select: userAuthLookupSelect,
    })
  )
}

export async function getCurrentUserProfile() {
  const current = await requireUser()
  return getUserById(current.id)
}

export async function getCurrentUserAccountStatus() {
  noStore()
  const current = await requireUser()

  return mapUser(
    await prisma.user.findUnique({
      where: { id: current.id },
      select: userAccountStatusSelect,
    })
  )
}

export async function getCurrentUserOperationalSnapshot() {
  noStore()
  const current = await requireActiveUser()

  return mapUser(
    await prisma.user.findUnique({
      where: { id: current.id },
      select: userOperationalSnapshotSelect,
    })
  )
}

export async function getUserPrivateAccountInfo() {
  noStore()
  const current = await requireActiveUser()

  return mapUser(
    await prisma.user.findUnique({
      where: { id: current.id },
      select: userPrivateAccountSelect,
    })
  )
}

export async function getUserSafeDisplayIdentity(userId: string) {
  noStore()
  const current = await requireActiveUser()

  if (current.id !== userId) return null

  return prisma.user.findUnique({
    where: { id: userId },
    select: userSafeIdentitySelect,
  })
}

export async function getUserEmailSummary(userId: string) {
  noStore()
  const current = await requireActiveUser()

  if (current.id !== userId) return null

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
    },
  })
}
