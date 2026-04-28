import "server-only"

import { getUserSetupStatus } from "@/lib/auth/setup-gates"
import { requireActiveUser } from "@/lib/auth/current-user"
import {
  getAcceptReadiness,
  getCreateReadiness,
  getReturnState,
  getSettingsReadiness,
} from "@/lib/setup/status"
import { setupPageStateInputSchema } from "@/schemas/setup"
import type { SetupGateResult, SetupPageState, SetupStatus } from "@/types/setup"

export async function getSetupPageState(input?: unknown): Promise<SetupPageState> {
  const user = await requireActiveUser()
  const parsed = setupPageStateInputSchema.parse(input ?? {})
  const setup = await getUserSetupStatus(user.id)
  const returnState = getReturnState(parsed.returnTo)
  return {
    setup,
    gates: {
      createVouch: withReturnTo(getCreateReadiness(setup), parsed.returnTo),
      acceptVouch: withReturnTo(getAcceptReadiness(setup), parsed.returnTo),
      settings: withReturnTo(getSettingsReadiness(setup), parsed.returnTo),
    },
    ...(parsed.returnTo ? { returnTo: parsed.returnTo } : {}),
    returnState,
  }
}

export async function getSetupChecklist(): Promise<SetupStatus["checklist"]> {
  return (await getUserSetupStatus()).checklist
}

export async function getSetupProgress(): Promise<{ completed: number; total: number }> {
  const checklist = await getSetupChecklist()
  return {
    completed: checklist.filter((item) => item.status === "complete").length,
    total: checklist.length,
  }
}

export async function getSetupBlockersForAction(
  action: "create_vouch" | "accept_vouch" | "settings"
): Promise<SetupGateResult> {
  const setup = await getUserSetupStatus()
  if (action === "create_vouch") return getCreateVouchSetupGate()
  if (action === "accept_vouch") return getAcceptVouchSetupGate()
  return getSettingsReadiness(setup)
}

export async function getCreateVouchSetupGate(): Promise<SetupGateResult> {
  return getCreateReadiness(await getUserSetupStatus())
}

export async function getAcceptVouchSetupGate(): Promise<SetupGateResult> {
  return getAcceptReadiness(await getUserSetupStatus())
}

export async function getConfirmPresenceSetupGate(): Promise<never> {
  throw new Error(
    "CONFIRMATION_CONTEXT_REQUIRED: use assertConfirmPresenceSetupReady with Vouch context"
  )
}

export async function getTermsAcceptanceStatus(): Promise<{ accepted: boolean }> {
  return { accepted: (await getUserSetupStatus()).termsAccepted }
}

export async function getSetupReturnContext(
  input?: unknown
): Promise<Pick<SetupPageState, "returnTo" | "returnState">> {
  const parsed = setupPageStateInputSchema.parse(input ?? {})
  return {
    ...(parsed.returnTo ? { returnTo: parsed.returnTo } : {}),
    returnState: getReturnState(parsed.returnTo),
  }
}

export async function getAccountReadinessSummary(): Promise<SetupStatus> {
  return getUserSetupStatus()
}

function withReturnTo(gate: SetupGateResult, returnTo: string | undefined): SetupGateResult {
  return returnTo ? { ...gate, returnTo } : gate
}
