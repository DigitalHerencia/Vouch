// lib/fetchers/authFetchers.ts

import "server-only"

import { redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import {
  getCurrentClerkAuth,
  getCurrentClerkUser,
  mapClerkUserToLocalInput,
} from "@/lib/auth/clerk"
import { prisma } from "@/lib/db/prisma"
import { currentUserAuthSelect } from "@/lib/db/selects/auth.selects"
import { upsertUserFromClerkTx } from "@/lib/db/transactions/authTransactions"

type CurrentUserAuthRecord = Prisma.UserGetPayload<{ select: typeof currentUserAuthSelect }>

export type CurrentUser = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: "active" | "disabled"
  isAdmin: boolean
}

function isAdminFromClaims(sessionClaims: unknown): boolean {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return false
  }

  const claims = sessionClaims as {
    publicMetadata?: { role?: unknown; isAdmin?: unknown }
    metadata?: { role?: unknown; isAdmin?: unknown }
  }
  const metadata = claims.publicMetadata ?? claims.metadata
  return metadata?.role === "admin" || metadata?.isAdmin === true
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
        paymentMethodReady: string
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
    isAdmin: false,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    readiness: {
      paymentMethodReady: record.paymentCustomer?.paymentMethodReady ? "ready" : "not_started",
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

  let user = await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    select: currentUserAuthSelect,
  })

  if (!user) {
    const clerkUser = await getCurrentClerkUser()

    if (clerkUser) {
      await prisma.$transaction((tx) =>
        upsertUserFromClerkTx(tx, mapClerkUserToLocalInput(clerkUser))
      )

      user = await prisma.user.findUnique({
        where: { clerkUserId: session.userId },
        select: currentUserAuthSelect,
      })
    }
  }

  const mapped = mapCurrentUser(user)

  return mapped
    ? {
        ...mapped,
        isAdmin: isAdminFromClaims(session.sessionClaims),
      }
    : null
}

export async function requireUser() {
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
