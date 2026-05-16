import type { ReactNode } from "react"
import { Info } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { vouchPageCopy } from "@/content/vouches"

export interface ConfirmationPanelProps { merchantConfirmed: boolean; customerConfirmed: boolean; canConfirm: boolean; action?: ReactNode }

export function ConfirmationPanel({ merchantConfirmed, customerConfirmed, canConfirm, action }: ConfirmationPanelProps) {
  const copy = vouchPageCopy.detail
  return (
    <Card className="rounded-none border-neutral-800 bg-black">
      <CardHeader><CardTitle>{copy.sections.confirmation}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Party label={copy.labels.merchant} confirmed={merchantConfirmed} />
          <Badge className="rounded-none border-neutral-700 bg-neutral-950 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-300">{merchantConfirmed && customerConfirmed ? copy.states.bothConfirmed : copy.states.waiting}</Badge>
          <Party label={copy.labels.customer} confirmed={customerConfirmed} align="right" />
        </div>
        <Separator className="bg-neutral-800" />
        {canConfirm ? action : null}
        <Alert className="rounded-none border border-blue-900/70 bg-blue-950/30 text-blue-100"><Info className="size-4" /><AlertDescription>{copy.oneSidedRule}</AlertDescription></Alert>
      </CardContent>
    </Card>
  )
}

function Party({ label, confirmed, align }: { label: string; confirmed: boolean; align?: "right" }) {
  return <div className={align === "right" ? "text-right" : ""}><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p><p className="mt-1 text-sm font-medium text-white">{confirmed ? vouchPageCopy.detail.states.confirmed : vouchPageCopy.detail.states.notConfirmed}</p></div>
}