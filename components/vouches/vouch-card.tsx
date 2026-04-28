import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VouchStatusBadge, type VouchStatus } from "@/components/vouches/vouch-status-badge"
import { VouchDeadline } from "@/components/vouches/vouch-deadline"
import { formatMoney } from "@/components/vouches/vouch-amount-summary"
import { cn } from "@/lib/utils"

export function VouchCard({
  href,
  status,
  role,
  amountCents,
  currency = "usd",
  otherPartyLabel,
  confirmationExpiresAt,
  nextActionLabel,
  outcomeText,
  className,
}: {
  href: string
  status: VouchStatus
  role: "payer" | "payee"
  amountCents: number
  currency?: string
  otherPartyLabel: string
  confirmationExpiresAt: Date | string
  nextActionLabel?: string
  outcomeText?: string
  className?: string
}) {
  return (
    <Card className={cn("hover:bg-muted/30 transition-colors", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>
              <Link href={href} className="outline-none hover:underline focus-visible:underline">
                {formatMoney(amountCents, currency)} Vouch
              </Link>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              You are the {role}. Other party: {otherPartyLabel}.
            </p>
          </div>
          <VouchStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <VouchDeadline value={confirmationExpiresAt} />
        {nextActionLabel ? (
          <p className="text-sm font-medium">Next action: {nextActionLabel}</p>
        ) : null}
        {outcomeText ? <p className="text-muted-foreground text-sm">{outcomeText}</p> : null}
      </CardContent>
    </Card>
  )
}
