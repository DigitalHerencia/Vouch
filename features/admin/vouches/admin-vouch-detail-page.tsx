import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminVouchDetailPageProps = {
  vouchId: string
  status: string
  payerId: string
  payeeId?: string
  paymentStatus: string
  refundStatus?: string
  confirmationStatus: string
  auditEvents: { id: string; eventName: string; actorType: string; createdAtLabel: string }[]
}

export function AdminVouchDetailPage({ vouchId, status, payerId, payeeId = "Unaccepted", paymentStatus, refundStatus = "Not required", confirmationStatus, auditEvents }: AdminVouchDetailPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <Card><CardHeader><CardTitle>Vouch operational detail</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><Item label="Vouch ID" value={vouchId} /><Item label="Status" value={status} /><Item label="Payer ID" value={payerId} /><Item label="Payee ID" value={payeeId} /><Item label="Payment status" value={paymentStatus} /><Item label="Refund status" value={refundStatus} /><Item label="Confirmation status" value={confirmationStatus} /></CardContent></Card>
        <Card className="border-amber-500/30 bg-amber-500/5"><CardHeader><CardTitle>No arbitration controls</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Admins may inspect operational state and retry safe technical operations. Admins must not award funds, rewrite confirmations, or decide who was right.</p></CardContent></Card>
      </section>
      <aside><Card><CardHeader><CardTitle>Audit timeline</CardTitle></CardHeader><CardContent className="space-y-4">{auditEvents.length === 0 ? <p className="text-sm text-muted-foreground">No audit events found.</p> : auditEvents.map((event) => <div key={event.id} className="border-l pl-3"><p className="text-sm font-medium">{event.eventName}</p><p className="text-xs text-muted-foreground">{event.actorType} · {event.createdAtLabel}</p></div>)}</CardContent></Card></aside>
    </main>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-background p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 break-all font-medium">{value}</p></div>
}
