import { ArrowRight } from "lucide-react"

import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { vouchPageCopy } from "@/content/vouches"

export function VouchActionsPanel() {
  const copy = vouchPageCopy.detail

  return (
    <Surface variant="muted">
      <SurfaceHeader className="flex items-center justify-between gap-4">
        <h2 className="text-[26px] leading-none text-white">{copy.sections.rule}</h2>
        <ArrowRight className="size-5 text-primary" />
      </SurfaceHeader>
      <SurfaceBody className="text-sm leading-7 text-neutral-400">
        {copy.ruleDescription}
      </SurfaceBody>
    </Surface>
  )
}
