import type { ReactNode } from "react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { CreateVouchForm } from "@/features/vouches/create/create-vouch-form.client"

type CreateVouchPageProps = {
  blockedReason?: string
  setupHref?: string
  children?: ReactNode
}

export function CreateVouchPage({
  blockedReason,
  setupHref = "/setup?return_to=/vouches/new",
  children,
}: CreateVouchPageProps) {
  return (
    <main className="flex w-full flex-col gap-6">
      <div>
        <a href="/dashboard" className="text-sm text-blue-500">← Back to dashboard</a>
        <SectionIntro
          className="mt-5"
          eyebrow="Merchant action"
          title="Create a Vouch"
          body="Set the amount, meeting window, and recipient. Funds release only if both parties confirm presence during the confirmation window."
        />
      </div>
      {blockedReason ? (
        <CalloutPanel
          className="border-amber-500/30 bg-amber-500/5"
          title="Finish setup to continue"
          body={blockedReason}
          actions={<Button render={<a href={setupHref} />}>Review setup</Button>}
        />
      ) : (
        <Surface>
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Vouch details
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Both people must confirm during the window for funds to release. If both do not
              confirm in time, the payment is refunded or not captured.
            </p>
          </SurfaceHeader>
          <SurfaceBody>{children ?? <CreateVouchForm />}</SurfaceBody>
        </Surface>
      )}
      <Surface variant="muted">
        <SurfaceHeader>
          <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
            Before you create
          </h2>
        </SurfaceHeader>
        <SurfaceBody className="grid gap-3 text-sm text-neutral-400 md:grid-cols-3">
          <p>Vouch does not judge disputes or decide who was right.</p>
          <p>One-sided confirmation never releases funds.</p>
          <p>Fees must be shown before payment commitment.</p>
        </SurfaceBody>
      </Surface>
    </main>
  )
}
