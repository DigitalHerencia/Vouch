import { Check } from "lucide-react"

import { EmptyStatePreset } from "@/components/ui/empty-state"
import type { VouchStatusTimelineItem } from "@/types/vouchTypes"

export function VouchStatusTimeline({ items }: { items: VouchStatusTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyStatePreset
        preset="no-data"
        variant="card"
        customTitle="No status events"
        customDescription="Vouch events will appear here when they are recorded."
      />
    )
  }

  return (
    <ol className="relative grid gap-3 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:border-l before:border-dashed before:border-neutral-600">
      {items.map((item, index) => (
        <li key={item.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <div
            className={[
              "relative z-10 flex size-8 items-center justify-center border-2 border-neutral-500 font-mono text-xs font-black",
              item.state === "completed" || item.state === "current"
                ? "bg-blue-600 text-white"
                : "bg-neutral-950 text-neutral-300",
            ].join(" ")}
          >
            {item.state === "completed" ? <Check className="size-4" /> : index + 1}
          </div>

          <div
            className={[
              "min-w-0 border p-3",
              item.state === "current"
                ? "border-blue-600 bg-neutral-950"
                : "border-neutral-600 bg-black",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="text-sm leading-5 font-black tracking-wide text-white uppercase">
                {item.title}
              </h4>
              {item.timeLabel ? (
                <time className="font-mono text-[11px] leading-5 font-bold text-neutral-400 uppercase">
                  {item.timeLabel}
                </time>
              ) : null}
            </div>

            <p className="mt-1 text-xs leading-5 font-semibold text-neutral-400">
              {item.description}
            </p>

            {item.meta ? (
              <p className="mt-2 w-fit border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-[11px] font-black text-neutral-300 uppercase">
                {item.meta}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
