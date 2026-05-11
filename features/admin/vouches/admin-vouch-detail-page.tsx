import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"

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

export function AdminVouchDetailPage({
  vouchId,
  status,
  payerId,
  payeeId = "Unaccepted",
  paymentStatus,
  refundStatus = "Not required",
  confirmationStatus,
  auditEvents,
}: AdminVouchDetailPageProps) {
  return (
    <main className="grid w-full gap-6 lg:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <SectionIntro
          eyebrow="Operations"
          title="Vouch detail"
          body="Inspect deterministic state only. No admin surface can award funds or rewrite confirmation truth."
        />
        <Surface>
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">Vouch operational detail</h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-3 md:grid-cols-2">
            <Item label="Vouch ID" value={vouchId} />
            <Item label="Status" value={status} />
            <Item label="Payer ID" value={payerId} />
            <Item label="Payee ID" value={payeeId} />
            <Item label="Payment status" value={paymentStatus} />
            <Item label="Refund status" value={refundStatus} />
            <Item label="Confirmation status" value={confirmationStatus} />
          </SurfaceBody>
        </Surface>
        <Surface className="border-amber-500/30 bg-amber-500/5">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">No arbitration controls</h2>
          </SurfaceHeader>
          <SurfaceBody>
            <p className="text-sm text-neutral-400">
              Admins may inspect operational state and retry safe technical operations. Admins must
              not award funds, rewrite confirmations, or decide who was right.
            </p>
          </SurfaceBody>
        </Surface>
      </section>
      <aside>
        <Surface>
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">Audit timeline</h2>
          </SurfaceHeader>
          <SurfaceBody className="space-y-4">
            {auditEvents.length === 0 ? (
              <p className="text-sm text-neutral-400">No audit events found.</p>
            ) : (
              auditEvents.map((event) => (
                <div key={event.id} className="border-l border-blue-800 pl-3">
                  <p className="text-sm font-medium">{event.eventName}</p>
                  <p className="text-xs text-neutral-400">
                    {event.actorType} · {event.createdAtLabel}
                  </p>
                </div>
              ))
            )}
          </SurfaceBody>
        </Surface>
      </aside>
    </main>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-800 bg-black/45 p-4">
      <p className="font-mono text-xs tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-1 font-medium break-all">{value}</p>
    </div>
  )
}
