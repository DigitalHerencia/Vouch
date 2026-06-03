import { CTASection } from "@/components/blocks/cta-section"
import {
  VouchCreationFeatureClient,
  type VouchCreationActionResult,
  type VouchCreationDraft,
} from "@/features/vouches/vouchCreationFeatureClient"
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
  const showReadinessNotice =
    state.variant === "blocked" ||
    state.gate.readiness?.paymentMethodReady !== "ready" ||
    state.gate.readiness?.payoutReadiness !== "ready"

  return (
    <main className="h-[calc(100dvh-8rem)] overflow-y-auto p-4 md:p-8 lg:p-12">
      <section className="grid min-h-full gap-8 md:gap-16">
        {showReadinessNotice ? <CTASection.DashboardRequirementsNotice /> : null}
        <Panel title="Create Vouch">
          <VouchCreationFeatureClient
            onSaveAmount={saveVouchAmountStep}
            onSaveWindow={saveVouchWindowStep}
            onCreateVouch={createVouchWizardStep}
          />
        </Panel>
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
