import "server-only"

import { prisma } from "@/lib/db/prisma"
import { getCurrentUserId } from "@/lib/auth/current-user"
import {
  buildSetupStatus,
  getAcceptReadiness,
  getConfirmPresenceReadiness,
  getCreateReadiness,
} from "@/lib/setup/status"
import type { ConfirmationGateInput, SetupGateResult, SetupStatus } from "@/types/setup"
import { CURRENT_TERMS_VERSION } from "@/lib/constants/terms"

export async function getUserSetupStatus(userId?: string): Promise<SetupStatus> {
  const resolvedUserId = userId ?? (await getCurrentUserId())
  if (!resolvedUserId) {
    throw new Error("AUTH_REQUIRED: setup status requires an authenticated user")
  }

  const user = await prisma.user.findUnique({
    where: { id: resolvedUserId },
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
      termsAcceptances: {
        where: { termsVersion: CURRENT_TERMS_VERSION },
        select: { id: true },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error("NOT_FOUND: user setup status not found")
  }

  return buildSetupStatus({
    userStatus: user.status,
    identityStatus: user.verificationProfile?.identityStatus ?? "unstarted",
    adultStatus: user.verificationProfile?.adultStatus ?? "unstarted",
    paymentReadiness: user.verificationProfile?.paymentReadiness ?? "not_started",
    payoutReadiness: user.verificationProfile?.payoutReadiness ?? "not_started",
    termsAccepted: user.termsAcceptances.length > 0,
  })
}

export async function assertCreateVouchSetupReady(userId?: string): Promise<SetupGateResult> {
  const setup = await getUserSetupStatus(userId)
  const gate = getCreateReadiness(setup)
  if (!gate.ok) {
    throw new Error(`SETUP_BLOCKED: ${gate.blockers.join(",")}`)
  }
  return gate
}

export async function assertAcceptVouchSetupReady(userId?: string): Promise<SetupGateResult> {
  const setup = await getUserSetupStatus(userId)
  const gate = getAcceptReadiness(setup)
  if (!gate.ok) {
    throw new Error(`SETUP_BLOCKED: ${gate.blockers.join(",")}`)
  }
  return gate
}

export async function assertConfirmPresenceSetupReady(
  input: ConfirmationGateInput
): Promise<SetupGateResult> {
  const gate = getConfirmPresenceReadiness(input)
  if (!gate.ok) {
    throw new Error(`CONFIRMATION_BLOCKED: ${gate.blockers.join(",")}`)
  }
  return gate
}
