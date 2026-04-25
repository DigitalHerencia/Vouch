import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SetupChecklistItem, type SetupChecklistItemStatus } from "@/components/setup/setup-checklist-item"
import { cn } from "@/lib/utils"

export type SetupChecklistItemModel = {
  id: string
  title: string
  description: string
  status: SetupChecklistItemStatus
  action?: React.ReactNode
}

export function SetupChecklist({
  items,
  className,
}: {
  items: SetupChecklistItemModel[]
  className?: string
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Finish setup to continue</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map((item) => (
          <SetupChecklistItem key={item.id} {...item} />
        ))}
      </CardContent>
    </Card>
  )
}
