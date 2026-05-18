import { CheckCircle2 } from "lucide-react"

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

export interface VouchTimelinePanelProps {
  timeline: { label: string; timestampLabel: string }[]
  title: string
  emptyLabel: string
}

export function VouchTimelinePanel({ timeline, title, emptyLabel }: VouchTimelinePanelProps) {
  return (
    <TimelineCard>
      <h2 className="mb-6 font-(family-name:--font-display) text-3xl leading-none tracking-[0.04em] text-white uppercase">
        {title}
      </h2>
      {timeline.length > 0 ? (
        <Timeline>
          {timeline.map((event, index) => (
            <TimelineItem key={`${event.label}-${event.timestampLabel}`} status="completed">
              <div>
                <TimelineDot status="completed">
                  <CheckCircle2 className="h-4 w-4" />
                </TimelineDot>
                {index < timeline.length - 1 ? <TimelineConnector status="completed" /> : null}
              </div>
              <TimelineContent>
                <TimelineHeader>
                  <TimelineTitle>{event.label}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                  <TimelineTime>{event.timestampLabel}</TimelineTime>
                </TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <EmptyStatePreset
          preset="no-data"
          customTitle="No timeline"
          customDescription={emptyLabel}
          variant="filled"
          className="bg-black/40"
        />
      )}
    </TimelineCard>
  )
}
