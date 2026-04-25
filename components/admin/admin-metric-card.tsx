import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function AdminMetricCard({
  label,
  value,
  description,
  className,
}: {
  label: string
  value: string | number
  description?: string
  className?: string
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  )
}
