import "server-only"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import { prisma } from "@/lib/db/prisma"
import {
  currentUserAuthSelect,
  contextualParticipantRoleSelect,
  inviteCandidateAuthSelect,
} from "@/lib/db/selects/auth.selects"

type CurrentUserAuthRecord = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  verificationProfile: {
    identityStatus: string
    adultStatus: string
  } | null
  paymentCustomer: { readiness: string } | null
  connectedAccount: { readiness: string } | null
  termsAcceptances: Array<{
    termsVersion: string
    acceptedAt: Date
  }>
}

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
        identityStatus: string
        adultStatus: string
        paymentReadiness: string
        payoutReadiness: string
        termsAccepted: boolean
        termsVersion: string | null
        termsAcceptedAt: string | null
      }
    })
  | null {
  if (!record) return null

  const terms = record.termsAcceptances?.[0] ?? null

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
      identityStatus: record.verificationProfile?.identityStatus ?? "unstarted",
      adultStatus: record.verificationProfile?.adultStatus ?? "unstarted",
      paymentReadiness: record.paymentCustomer?.readiness ?? "not_started",
      payoutReadiness: record.connectedAccount?.readiness ?? "not_started",
      termsAccepted: Boolean(terms),
      termsVersion: terms?.termsVersion ?? null,
      termsAcceptedAt: toIso(terms?.acceptedAt),
    },
  }
}

export async function getCurrentUser() {
  noStore()

  const session = await auth()
  if (!session.userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    select: currentUserAuthSelect,
  })

  const mapped = mapCurrentUser(user)

  return mapped
    ? {
        ...mapped,
        isAdmin: isAdminFromClaims(session.sessionClaims),
      }
    : null
}

export async function getCurrentUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
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

export async function getAuthPageState(input?: {
  returnTo?: string | null
  inviteToken?: string | null
}) {
  const user = await getCurrentUser()

  return {
    variant: user ? "authenticated" : "anonymous",
    user,
    returnTo: input?.returnTo ?? "/dashboard",
    inviteToken: input?.inviteToken ?? null,
  }
}

export async function getSignInPageState(input?: {
  returnTo?: string | null
  inviteToken?: string | null
}) {
  return getAuthPageState(input)
}

export async function getSignUpPageState(input?: {
  returnTo?: string | null
  inviteToken?: string | null
}) {
  return getAuthPageState(input)
}

export async function getAuthCallbackState(input?: { returnTo?: string | null }) {
  const user = await getCurrentUser()

  return {
    variant: user ? "ready" : "missing_local_user",
    userId: user?.id ?? null,
    redirectTo: input?.returnTo ?? "/dashboard",
  }
}

export async function getSignedOutRedirectState(input?: { returnTo?: string | null }) {
  return {
    variant: "signed_out",
    redirectTo: `/sign-in${input?.returnTo ? `?return_to=${encodeURIComponent(input.returnTo)}` : ""}`,
  }
}

export async function getUserSetupStatus(userId: string) {
  noStore()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: currentUserAuthSelect,
  })

  const mapped = mapCurrentUser(user)
  if (!mapped) return null

  const missing: string[] = []
  if (mapped.status !== "active") missing.push("account_active")
  if (mapped.readiness.identityStatus !== "verified") missing.push("identity_verified")
  if (mapped.readiness.adultStatus !== "verified") missing.push("adult_verified")
  if (mapped.readiness.paymentReadiness !== "ready") missing.push("payment_ready")
  if (mapped.readiness.payoutReadiness !== "ready") missing.push("payout_ready")
  if (!mapped.readiness.termsAccepted) missing.push("terms_accepted")

  return {
    userId: mapped.id,
    status: mapped.status,
    readiness: mapped.readiness,
    missing,
    complete: missing.length === 0,
  }
}

export async function getUserAuthzSnapshot(userId: string) {
  const setup = await getUserSetupStatus(userId)

  return {
    userId,
    active: setup?.status === "active",
    canCreateVouch:
      setup?.status === "active" &&
      setup.readiness.identityStatus === "verified" &&
      setup.readiness.adultStatus === "verified" &&
      setup.readiness.paymentReadiness === "ready" &&
      setup.readiness.termsAccepted,
    canAcceptVouch:
      setup?.status === "active" &&
      setup.readiness.identityStatus === "verified" &&
      setup.readiness.adultStatus === "verified" &&
      setup.readiness.payoutReadiness === "ready" &&
      setup.readiness.termsAccepted,
    canConfirmPresence: setup?.status === "active",
    setup,
  }
}

export async function getContextualParticipantRole(input: { vouchId: string; userId?: string }) {
  noStore()

  const userId = input.userId ?? (await getCurrentUserId())
  if (!userId) return { role: null, authorized: false }

  const vouch = await prisma.vouch.findUnique({
    where: { id: input.vouchId },
    select: contextualParticipantRoleSelect,
  })

  if (!vouch) return { role: null, authorized: false }

  if (vouch.merchantId === userId) return { role: "merchant" as const, authorized: true }
  if (vouch.customerId === userId) return { role: "customer" as const, authorized: true }

  return { role: null, authorized: false }
}

export async function getInvitePreservedAuthContext(token: string) {
  noStore()

  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash: token },
    select: inviteCandidateAuthSelect,
  })

  if (!invitation) {
    return { variant: "invalid", token }
  }

  const now = new Date()
  if (invitation.expiresAt <= now) {
    return { variant: "expired", token, invitationId: invitation.id }
  }

  return {
    variant: "valid",
    token,
    invitationId: invitation.id,
    recipientEmail: invitation.recipientEmail,
    vouchId: invitation.vouchId,
    vouchStatus: invitation.vouch.status,
    returnTo: `/vouches/invite/${token}`,
  }
}
