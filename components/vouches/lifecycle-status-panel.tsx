import { CalendarDays, Clock, TimerReset } from "lucide-react"

import {
  Timeline,
  TimelineCard,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from "@/components/ui/timeline"

export function LifecycleStatusPanel({
  title,
  appointmentLabel,
  windowLabel,
  deadlineLabel,
  labels,
}: {
  title: string
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  labels: Record<string, string>
}) {
  const rows = [
    {
      label: labels.appointment,
      value: appointmentLabel,
      icon: CalendarDays,
      status: "completed" as const,
    },
    {
      label: labels.opens,
      value: windowLabel,
      icon: Clock,
      status: "current" as const,
    },
    {
      label: labels.expires,
      value: deadlineLabel,
      icon: TimerReset,
      status: "upcoming" as const,
    },
  ]

  return (
    <TimelineCard>
      <h2 className="mb-6 font-(family-name:--font-display) text-3xl leading-none tracking-[0.04em] text-white uppercase">
        {title}
      </h2>
      <Timeline>
        {rows.map((row, index) => {
          const Icon = row.icon
          return (
            <TimelineItem key={row.label} status={row.status}>
              <div>
                <TimelineDot status={row.status}>
                  <Icon className="h-4 w-4" />
                </TimelineDot>
                {index < rows.length - 1 ? <TimelineConnector status={row.status} /> : null}
              </div>
              <TimelineContent>
                <TimelineHeader>
                  <TimelineTitle>{row.label}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>{row.value}</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          )
        })}
      </Timeline>
    </TimelineCard>
  )
}
