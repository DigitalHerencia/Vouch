import { Timeline } from "@/components/status/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface VouchTimelinePanelProps {
  timeline: { label: string; timestampLabel: string }[]
  title: string
  emptyLabel: string
}

export function VouchTimelinePanel({ timeline, title, emptyLabel }: VouchTimelinePanelProps) {
  return (
    <Card className="bg-black/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length > 0 ? (
          <Timeline items={timeline} className="border-neutral-800 bg-black" />
        ) : (
          <p className="text-sm leading-6 font-bold text-neutral-400">
            {emptyLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
