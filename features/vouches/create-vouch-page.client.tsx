"use client"

import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { vouchPageCopy } from "@/content/vouches"

export function CreateVouchReadyPanel() {
  return (
    <Surface variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">
          {vouchPageCopy.create.detailsHeader}
        </h2>
      </SurfaceHeader>
      <SurfaceBody>
        <p className="max-w-2xl text-sm leading-7 text-neutral-300">
          {vouchPageCopy.create.readyBody}
        </p>
      </SurfaceBody>
    </Surface>
  )
}
