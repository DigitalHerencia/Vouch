import { cn } from "@/lib/utils"

export function VouchDeadline({
  label = "Confirmation closes",
  value,
  helperText,
  className,
}: {
  label?: string
  value: Date | string
  helperText?: string
  className?: string
}) {
  const date = typeof value === "string" ? new Date(value) : value
  const absolute = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

  return (
    <div className={cn("grid gap-1 text-sm", className)}>
      <div className="text-muted-foreground">{label}</div>
      <time dateTime={date.toISOString()} className="font-medium text-foreground">
        {absolute}
      </time>
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}
