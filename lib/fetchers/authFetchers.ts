import "server-only"

import {
  getCurrentUser as getAuthCurrentUser,
  getCurrentUserId as getAuthCurrentUserId,
  requireActiveUser as requireAuthActiveUser,
  requireUser as requireAuthUser,
} from "@/lib/auth/current-user"
import { prisma } from "@/lib/db/prisma"

export async function getCurrentUser() {
  return getAuthCurrentUser()
}

export async function getCurrentUserId() {
  return getAuthCurrentUserId()
}

export async function requireUser() {
  return requireAuthUser()
}

export async function requireActiveUser() {
  return requireAuthActiveUser()
}

export async function getAuthPageState(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getSignInPageState(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getSignUpPageState(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getAuthCallbackState(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getSignedOutRedirectState(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getUserSetupStatus() {
  const user = await requireAuthActiveUser()
  const setup = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      status: true,
      verificationProfile: {
        select: {
          identityStatus: true,
          adultStatus: true,
          paymentReadiness: true,
          payoutReadiness: true,
        },
      },
      termsAcceptances: { select: { id: true }, take: 1 },
    },
  })

  return {
    userStatus: setup.status,
    identityStatus: setup.verificationProfile?.identityStatus ?? "unstarted",
    adultStatus: setup.verificationProfile?.adultStatus ?? "unstarted",
    paymentReadiness: setup.verificationProfile?.paymentReadiness ?? "not_started",
    payoutReadiness: setup.verificationProfile?.payoutReadiness ?? "not_started",
    termsAccepted: setup.termsAcceptances.length > 0,
  }
}

export async function getUserAuthzSnapshot(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getContextualParticipantRole(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}

export async function getInvitePreservedAuthContext(..._args: unknown[]): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/fetcher/authFetchers.ts")
}
