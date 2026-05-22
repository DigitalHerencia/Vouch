import Link from "next/link"

import {
  OnboardingFlow,
  type VouchCreationActionResult,
  type VouchCreationDraft,
} from "@/components/blocks/onboarding-flow"
import { Button } from "@/components/ui/button"
import {
  calculatePlatformFee,
  createVouch,
  validateCreateVouchDraft,
} from "@/lib/actions/vouchActions"
import { getCreateVouchPageState } from "@/lib/fetchers/vouchFetchers"

function parseAmountCents(amountDollars: string): number {
  const normalized = amountDollars.trim().replace(/[$,\s]/g, "")
  const amount = Number(normalized)

  if (!Number.isFinite(amount)) return 0

  return Math.round(amount * 100)
}

function toCreateInput(draft: VouchCreationDraft) {
  return {
    amountCents: parseAmountCents(draft.amountDollars),
    currency: "usd" as const,
    appointmentStartsAt: draft.appointmentStartsAt,
    confirmationOpensAt: draft.confirmationOpensAt,
    confirmationExpiresAt: draft.confirmationExpiresAt,
  }
}

export async function saveVouchAmountStep(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  "use server"

  return calculatePlatformFee({
    amountCents: parseAmountCents(draft.amountDollars),
    currency: "usd",
  })
}

export async function saveVouchWindowStep(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  "use server"

  return validateCreateVouchDraft(toCreateInput(draft))
}

export async function createVouchWizardStep(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  "use server"

  return createVouch({
    ...toCreateInput(draft),
    disclaimerAccepted: draft.disclaimerAccepted,
  })
}

export async function VouchForm() {
  const state = await getCreateVouchPageState()
  const blockedReason = state.variant === "blocked" ? state.gate.blockers.join(", ") : null

  return (
    <main className="h-[calc(100dvh-8rem)] overflow-hidden p-4 md:p-8 lg:p-12">
      <section className="grid h-full min-h-0 gap-8 overflow-hidden md:gap-16">
        {blockedReason ? (
          <Panel title="Readiness required">
            <div className="grid h-full content-center gap-4">
              <p className="max-w-prose text-sm leading-6 font-semibold text-neutral-400">
                {blockedReason}
              </p>
              <div>
                <Button asChild>
                  <Link href="/dashboard">Return to dashboard</Link>
                </Button>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Create Vouch">
            <OnboardingFlow.VouchCreation
              onSaveAmount={saveVouchAmountStep}
              onSaveWindow={saveVouchWindowStep}
              onCreateVouch={createVouchWizardStep}
            />
          </Panel>
        )}
      </section>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 overflow-hidden border border-neutral-400 bg-black p-3 md:p-4">
      <div className="flex min-h-0 w-full flex-col gap-3 overflow-hidden">
        <div className="shrink-0 border-b border-neutral-400 pb-3">
          <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">Vouch</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
