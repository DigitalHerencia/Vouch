import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ConfirmationState = {
  payerConfirmed: boolean
  payeeConfirmed: boolean
  canConfirm: boolean
  confirmHref?: string
}

type VouchDetailPageProps = {
  title: string
  amountLabel: string
  statusLabel: string
  roleLabel: string
  otherPartyLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  finalOutcomeLabel?: string
  confirmation: ConfirmationState
  timeline?: { label: string; timestampLabel: string }[]
}

export function VouchDetailPage({
  title,
  amountLabel,
  statusLabel,
  roleLabel,
  otherPartyLabel,
  windowLabel,
  deadlineLabel,
  paymentStatusLabel,
  finalOutcomeLabel,
  confirmation,
  timeline = [],
}: VouchDetailPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <p className="text-muted-foreground text-sm">{statusLabel}</p>
            <CardTitle className="text-3xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Info label="Amount" value={amountLabel} />
            <Info label="Your role" value={roleLabel} />
            <Info label="Other party" value={otherPartyLabel} />
            <Info label="Payment status" value={paymentStatusLabel} />
            <Info label="Meeting window" value={windowLabel} />
            <Info label="Confirmation deadline" value={deadlineLabel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Payer"
                value={confirmation.payerConfirmed ? "Confirmed" : "Not confirmed"}
              />
              <Info
                label="Payee"
                value={confirmation.payeeConfirmed ? "Confirmed" : "Not confirmed"}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Funds release only after both parties confirm during the window.
            </p>
            {confirmation.canConfirm && confirmation.confirmHref ? (
              <Button render={<a href={confirmation.confirmHref} />}>Confirm Presence</Button>
            ) : null}
          </CardContent>
        </Card>
        {finalOutcomeLabel ? (
          <Card>
            <CardHeader>
              <CardTitle>Final outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{finalOutcomeLabel}</p>
            </CardContent>
          </Card>
        ) : null}
      </section>
      <aside>
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-sm">No participant-safe events yet.</p>
            ) : (
              timeline.map((event) => (
                <div key={`${event.label}-${event.timestampLabel}`} className="border-l pl-3">
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-muted-foreground text-xs">{event.timestampLabel}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-lg border p-4">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
