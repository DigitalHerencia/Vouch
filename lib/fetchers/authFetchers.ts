// lib/fetchers/authFetchers.ts

import "server-only"

import { redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { getCurrentClerkAuth } from "@/lib/auth/clerk"
import { prisma } from "@/lib/db/prisma"
import { currentUserAuthSelect } from "@/lib/db/selects/auth.selects"

type CurrentUserAuthRecord = Prisma.UserGetPayload<{ select: typeof currentUserAuthSelect }>

type CurrentUser = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: "active" | "disabled"
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function isActive(user: { status: string } | null | undefined) {
  return user?.status === "active"
}

function mapCurrentUser(record: CurrentUserAuthRecord | null):
  | (CurrentUser & {
      createdAt: string | null
      updatedAt: string | null
      readiness: {
        payoutReadiness: string
      }
    })
  | null {
  if (!record) return null

  return {
    id: record.id,
    clerkUserId: record.clerkUserId,
    email: record.email,
    phone: record.phone,
    displayName: record.displayName,
    status: record.status === "active" ? ("active" as const) : ("disabled" as const),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    readiness: {
      payoutReadiness:
        record.connectedAccount?.detailsSubmitted && record.connectedAccount?.payoutsEnabled
          ? "ready"
          : "not_started",
    },
  }
}

export async function getCurrentUser() {
  noStore()

  const session = await getCurrentClerkAuth()
  if (!session.userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    select: currentUserAuthSelect,
  })

  return mapCurrentUser(user)
}

async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")
  return user
}

export async function requireActiveUser() {
  const user = await requireUser()
  if (!isActive(user)) redirect("/dashboard?blocked=account_disabled")
  return user
}

export async function getCurrentUserPaymentCustomer() {
  noStore()

  const user = await requireActiveUser()

  return prisma.paymentCustomer.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  })
}

export async function getCurrentUserConnectedAccount() {
  noStore()

  const user = await requireActiveUser()

  return prisma.connectedAccount.findUnique({
    where: { userId: user.id },
    select: { stripeAccountId: true },
  })
}
