import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    [labels.appointment, appointmentLabel],
    [labels.opens, windowLabel],
    [labels.expires, deadlineLabel],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-neutral-800 px-5 py-4 last:border-b-0"
          >
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
              {label}
            </p>
            <Badge className="border-neutral-700 bg-neutral-950 text-neutral-300">{value}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
