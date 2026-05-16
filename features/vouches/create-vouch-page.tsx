import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { vouchPageCopy } from "@/content/vouches"
import { CreateVouchReadyPanel } from "@/features/vouches/create-vouch-page.client"
import { getCreateVouchPageState } from "@/lib/fetchers/vouchFetchers"

export async function CreateVouchPage() {
  const state = await getCreateVouchPageState()
  const blockedReason =
    state.variant === "blocked" ? state.gate.blockers.join(", ") : null

  return (
    <main className="grid w-full gap-8">
      <section className="grid min-h-[300px] content-end border-b border-neutral-800 pb-8">
        <div className="max-w-3xl">
          <p className="vouch-label text-primary">{vouchPageCopy.create.eyebrow}</p>
          <SectionIntro className="mt-4" title={vouchPageCopy.create.title} />
        </div>
      </section>

      {blockedReason ? (
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="text-[26px] leading-none text-white">
              {vouchPageCopy.create.blockedTitle}
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-5">
            <p className="max-w-2xl text-sm leading-7 text-neutral-300">{blockedReason}</p>
            <Button className="w-fit" render={<Link href="/dashboard" />}>
              {vouchPageCopy.create.blockedActionLabel}
            </Button>
          </SurfaceBody>
        </Surface>
      ) : (
        <CreateVouchReadyPanel />
      )}

      <CalloutPanel
        title={vouchPageCopy.create.ruleTitle}
        body={vouchPageCopy.create.ruleBody}
      />
    </main>
  )
}
