import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ConfirmationState =
  | "not_confirmed"
  | "confirmed"
  | "ineligible"
  | "window_not_open"
  | "window_closed"

const LABELS: Record<ConfirmationState, string> = {
  not_confirmed: "Not confirmed",
  confirmed: "Confirmed",
  ineligible: "Ineligible",
  window_not_open: "Window not open",
  window_closed: "Window closed",
}

function ConfirmationLine({ label, state }: { label: string; state: ConfirmationState }) {
  const confirmed = state === "confirmed"
  return (
    <div className="bg-muted/20 flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <Badge
        variant="outline"
        className={
          confirmed
            ? "border-green-500/30 bg-green-500/10 text-green-200"
            : "border-neutral-500/30 bg-neutral-500/10 text-neutral-200"
        }
      >
        {LABELS[state]}
      </Badge>
    </div>
  )
}

export function ConfirmationPanel({
  payerState,
  payeeState,
  deadline,
  action,
  className,
}: {
  payerState: ConfirmationState
  payeeState: ConfirmationState
  deadline?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-blue-500/10", className)}>
      <CardHeader>
        <CardTitle>Presence confirmation</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ConfirmationLine label="Payer" state={payerState} />
        <ConfirmationLine label="Payee" state={payeeState} />
        <p className="text-muted-foreground text-sm">
          Funds release only after both parties confirm presence during the confirmation window.
        </p>
        {deadline ? <div>{deadline}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
