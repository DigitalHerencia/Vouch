import { Fragment } from "react"
import { Check } from "lucide-react"

import { EmptyStatePreset } from "@/components/ui/empty-state"
import {
  Timeline,
  TimelineCard,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

export function VouchStatusTimeline({ items }: { items: VouchStatusTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyStatePreset
        preset="no-data"
        variant="card"
        customTitle="No status events"
        customDescription="Provider, webhook, and confirmation events will appear here when the server records them."
      />
    )
  }

  return (
    <Timeline className="gap-0">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <TimelineItem status={item.state}>
            <TimelineDot status={item.state} size="lg">
              {item.state === "completed" ? (
                <Check className="size-5 text-white" />
              ) : (
                <span className="font-mono text-xs font-black text-white">{index + 1}</span>
              )}
            </TimelineDot>
            <TimelineContent>
              <TimelineCard className={item.state === "current" ? "border-blue-600" : undefined}>
                <TimelineHeader className="justify-between">
                  <TimelineTitle>{item.title}</TimelineTitle>
                  {item.timeLabel ? <TimelineTime>{item.timeLabel}</TimelineTime> : null}
                </TimelineHeader>
                <TimelineDescription>{item.description}</TimelineDescription>
                {item.meta ? (
                  <p className="mt-3 border border-neutral-400 bg-neutral-900 p-2 font-mono text-[11px] font-bold text-neutral-300 uppercase">
                    {item.meta}
                  </p>
                ) : null}
              </TimelineCard>
            </TimelineContent>
          </TimelineItem>
          {index < items.length - 1 ? <TimelineConnector status={item.state} /> : null}
        </Fragment>
      ))}
    </Timeline>
  )
}
