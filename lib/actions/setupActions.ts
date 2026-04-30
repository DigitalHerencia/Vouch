"use server"

import { redirect } from "next/navigation"

import { requireActiveUser } from "@/lib/auth/current-user"
import { prisma } from "@/lib/db/prisma"
import { acceptTermsTx } from "@/lib/db/transactions/setupTransactions"
import {
  acceptTermsSchema,
  setupPageStateInputSchema,
  startSetupProviderFlowSchema,
} from "@/schemas/setup"
import { CURRENT_TERMS_VERSION } from "@/lib/constants/terms"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import { getSetupPageState } from "@/lib/fetchers/setupFetchers"

export async function acceptTerms(input: unknown): Promise<ActionResult<{ acceptedAt: string }>> {
  const user = await requireActiveUser()
  const parsed = acceptTermsSchema.safeParse(input)
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the terms acceptance fields.",
      parsed.error.flatten().fieldErrors
    )
  }
  if (parsed.data.termsVersion !== CURRENT_TERMS_VERSION) {
    return actionFailure("TERMS_VERSION_MISMATCH", "Refresh and accept the current terms.")
  }

  const terms = await prisma.$transaction(async (tx) => {
    const acceptance = await acceptTermsTx(tx, {
      userId: user.id,
      termsVersion: parsed.data.termsVersion,
    })
    await tx.auditEvent.create({
      data: {
        eventName: "terms.accepted",
        actorType: "user",
        actorUserId: user.id,
        entityType: "terms_acceptance",
        entityId: acceptance.id,
        participantSafe: true,
        metadata: { terms_version: parsed.data.termsVersion },
      },
    })
    return acceptance
  })

  return actionSuccess({ acceptedAt: terms.acceptedAt.toISOString() })
}

export async function refreshSetupStatus(
  input?: unknown
): Promise<ActionResult<Awaited<ReturnType<typeof getSetupPageState>>>> {
  const parsed = setupPageStateInputSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the setup status request.",
      parsed.error.flatten().fieldErrors
    )
  }

  return actionSuccess(await getSetupPageState({ returnTo: parsed.data.returnTo ?? null }))
}

export async function continueAfterSetup(input?: unknown): Promise<never> {
  const parsed = startSetupProviderFlowSchema.parse(input ?? {})
  redirect(parsed.returnTo ?? "/dashboard")
}

export async function startRequiredSetupForCreate(): Promise<never> {
  redirect("/settings/payment")
}

export async function startRequiredSetupForAccept(): Promise<never> {
  redirect("/settings/payout")
}

export async function startRequiredSetupForConfirm(): Promise<never> {
  redirect("/setup")
}
