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
  setupHref = "/dashboard",
  children,
}: CreateVouchPageProps) {
  return (
    <main className="flex w-full flex-col gap-6">
      <div>
        <SectionIntro
          eyebrow="Merchant action"
          title="Create a Vouch"
        />
      </div>
      {blockedReason ? (
        <CalloutPanel
          className="border-amber-500/30 bg-amber-500/5"
          title="Finish setup to continue"
          body={blockedReason}
          actions={<Button render={<a href={setupHref} />}>Return to dashboard</Button>}
        />
      ) : (
        <Surface>
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Vouch details
            </h2>
          </SurfaceHeader>
          <SurfaceBody>{children ?? <CreateVouchForm />}</SurfaceBody>
        </Surface>
      )}
    </main>
  )
}
