import { cn } from "@/lib/utils"

export type VouchTimelineItem = {
  id: string
  label: string
  timestamp?: Date | string | null
  description?: string
}

export function VouchTimeline({
  items,
  className,
}: {
  items: VouchTimelineItem[]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-3", className)}>
      {items.map((item) => {
        const date = item.timestamp ? new Date(item.timestamp) : null
        return (
          <li key={item.id} className="grid gap-1 border-l pl-4">
            <div className="text-sm font-medium">{item.label}</div>
            {date ? (
              <time dateTime={date.toISOString()} className="text-muted-foreground text-xs">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(date)}
              </time>
            ) : null}
            {item.description ? (
              <p className="text-muted-foreground text-sm">{item.description}</p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
