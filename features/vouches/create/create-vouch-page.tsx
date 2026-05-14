import type { ReactNode } from "react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { vouchPageCopy } from "@/content/vouches"
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
  const copy = vouchPageCopy.create

  return (
    <main className="flex w-full flex-col gap-6">
      <div>
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
        />
      </div>
      {blockedReason ? (
        <CalloutPanel
          className="border-amber-500/30 bg-amber-500/5"
          title={copy.blockedTitle}
          body={blockedReason}
          actions={<Button render={<a href={setupHref} />}>{copy.blockedActionLabel}</Button>}
        />
      ) : (
        <Surface>
          <SurfaceHeader>
            <h2 className="text-[26px] leading-none text-white">{copy.detailsHeader}</h2>
          </SurfaceHeader>
          <SurfaceBody>{children ?? <CreateVouchForm />}</SurfaceBody>
        </Surface>
      )}
    </main>
  )
}
