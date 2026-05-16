import { CheckCircle2 } from "lucide-react"

import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { vouchPageCopy } from "@/content/vouches"

export interface VouchTimelinePanelProps {
  timeline: { label: string; timestampLabel: string }[]
}

export function VouchTimelinePanel({ timeline }: VouchTimelinePanelProps) {
  const copy = vouchPageCopy.detail

  return (
    <Surface variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">{copy.sections.timeline}</h2>
      </SurfaceHeader>
      <SurfaceBody className="space-y-4">
        {timeline.length ? (
          timeline.map((event) => (
            <div
              key={`${event.label}-${event.timestampLabel}`}
              className="grid grid-cols-[20px_1fr_auto] gap-3 text-sm"
            >
              <CheckCircle2 className="size-5 text-primary" />
              <span className="text-white">{event.label}</span>
              <span className="font-mono text-neutral-400">{event.timestampLabel}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-400">{copy.states.noTimeline}</p>
        )}
      </SurfaceBody>
    </Surface>
  )
}
