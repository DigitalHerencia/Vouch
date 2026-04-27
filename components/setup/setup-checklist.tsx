import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SetupChecklistItem,
  type SetupChecklistItemStatus,
} from "@/components/setup/setup-checklist-item"
import { cn } from "@/lib/utils"

export type SetupChecklistItemModel = {
  id: string
  title?: string
  description: string
  status: SetupChecklistItemStatus
  action?: ReactNode
}

type NormalizedSetupChecklistItemModel = Omit<SetupChecklistItemModel, "title"> & {
  title: string
}

const DEFAULT_ITEM_COPY: Record<string, { title: string; actionLabel?: string }> = {
  identity: {
    title: "Identity verification",
  },
  adult: {
    title: "Adult verification",
  },
  payment: {
    title: "Payment method",
    actionLabel: "Add payment method",
  },
  payout: {
    title: "Payout setup",
    actionLabel: "Connect payout account",
  },
  terms: {
    title: "Terms acceptance",
    actionLabel: "Accept terms",
  },
}

function normalizeSetupItem(item: SetupChecklistItemModel): NormalizedSetupChecklistItemModel {
  const defaults = DEFAULT_ITEM_COPY[item.id]
  const title = item.title?.trim() || defaults?.title || item.id

  if (item.action || !defaults?.actionLabel || item.status === "complete") {
    return {
      ...item,
      title,
    }
  }

  return {
    ...item,
    title,
    action: <span className="text-primary text-sm font-medium">{defaults.actionLabel}</span>,
  }
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
        {items.map((item) => {
          const normalizedItem = normalizeSetupItem(item)

          return <SetupChecklistItem key={normalizedItem.id} {...normalizedItem} />
        })}
      </CardContent>
    </Card>
  )
}
