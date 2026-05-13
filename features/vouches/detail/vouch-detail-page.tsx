import { CalendarDays, CheckCircle2, Clock, Info, UserRound } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import type { VouchStatus } from "@/types/vouch"

type ConfirmationState = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
  canConfirm: boolean
  action?: ReactNode
}

type VouchDetailPageProps = {
  vouchId: string
  title: string
  amountLabel: string
  statusLabel: VouchStatus | string
  currentUserRoleLabel: "merchant" | "customer" | "participant"
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  confirmation: ConfirmationState
  timeline: { label: string; timestampLabel: string }[]
}

export function VouchDetailPage({
  vouchId,
  title,
  amountLabel,
  statusLabel,
  currentUserRoleLabel,
  merchantLabel,
  customerLabel,
  appointmentLabel,
  windowLabel,
  deadlineLabel,
  paymentStatusLabel,
  settlementStatusLabel,
  merchantReceivesLabel,
  customerTotalLabel,
  confirmation,
  timeline,
}: VouchDetailPageProps) {
  return (
    <main className="grid w-full gap-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-500">
          Back to dashboard
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <Badge className="rounded-none bg-blue-700 text-white">{statusLabel}</Badge>
            <SectionIntro className="mt-3" title={title} />
            <p className="mt-2 font-mono text-sm text-neutral-400">
              Vouch ID <span className="bg-neutral-800 px-2 text-neutral-200">{vouchId}</span>
            </p>
          </div>
          <Badge className="rounded-none border border-neutral-700 bg-neutral-950 text-neutral-200">
            {currentUserRoleLabel}
          </Badge>
        </div>
      </div>

      <section className="grid gap-4 border-y border-neutral-800 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBlock icon={<UserRound />} label="Merchant" value={merchantLabel} />
        <InfoBlock icon={<UserRound />} label="Customer" value={customerLabel} />
        <InfoBlock icon={<CalendarDays />} label="Amount" value={amountLabel} />
        <InfoBlock icon={<Clock />} label="Window" value={windowLabel} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Confirmation status
            </h2>
          </SurfaceHeader>
          <SurfaceBody>
            <p className="text-sm text-neutral-400">
              Both parties must confirm presence within the window for funds to release.
            </p>
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Party label="Merchant" confirmed={confirmation.merchantConfirmed} />
              <div className="grid size-28 place-items-center border-4 border-blue-700 text-center font-mono text-sm text-white">
                {confirmation.merchantConfirmed && confirmation.customerConfirmed
                  ? "Both confirmed"
                  : "Waiting"}
              </div>
              <Party label="Customer" confirmed={confirmation.customerConfirmed} align="right" />
            </div>
            {confirmation.canConfirm ? <div className="mt-7">{confirmation.action}</div> : null}
            <p className="mt-4 border border-neutral-800 p-3 text-sm text-neutral-400">
              <Info className="mr-2 inline size-4 text-blue-500" />
              If both participants do not confirm by the deadline, the payment is voided, refunded,
              or not captured according to provider state.
            </p>
          </SurfaceBody>
        </Surface>

        <div className="grid gap-5">
          <Surface variant="muted">
            <SurfaceHeader>
              <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
                Schedule
              </h2>
            </SurfaceHeader>
            <SurfaceBody className="font-mono text-sm">
              <Line label="Appointment" value={appointmentLabel} />
              <Line label="Opens" value={windowLabel} />
              <Line label="Expires" value={deadlineLabel} />
            </SurfaceBody>
          </Surface>
          <Surface variant="muted">
            <SurfaceHeader>
              <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
                Payment details
              </h2>
            </SurfaceHeader>
            <SurfaceBody className="font-mono text-sm">
              <Line label="Vouch amount" value={amountLabel} />
              <Line label="Merchant receives" value={merchantReceivesLabel} />
              <Line label="Customer total" value={customerTotalLabel} strong />
              <p className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-none border-green-700 bg-green-950 text-green-400">
                  {paymentStatusLabel}
                </Badge>
                <Badge className="rounded-none border-neutral-700 bg-neutral-950 text-neutral-200">
                  {settlementStatusLabel}
                </Badge>
              </p>
            </SurfaceBody>
          </Surface>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              Timeline
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="space-y-4">
            {timeline.length ? (
              timeline.map((event) => (
                <div
                  key={`${event.label}-${event.timestampLabel}`}
                  className="grid grid-cols-[20px_1fr_auto] gap-3 text-sm"
                >
                  <CheckCircle2 className="size-5 text-blue-500" />
                  <span className="text-white">{event.label}</span>
                  <span className="font-mono text-neutral-400">{event.timestampLabel}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No participant-safe events recorded yet.</p>
            )}
          </SurfaceBody>
        </Surface>
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
              What happens next?
            </h2>
          </SurfaceHeader>
          <SurfaceBody className="grid gap-3 text-sm text-neutral-400">
            <p>
              <CheckCircle2 className="mr-2 inline size-4 text-green-500" />
              Both confirm in time: provider-backed capture can proceed.
            </p>
            <p>
              <Info className="mr-2 inline size-4 text-amber-500" />
              One or both do not confirm: provider state determines void, refund, or non-capture.
            </p>
            <p>No arbitration. Vouch follows the confirmation rule.</p>
          </SurfaceBody>
        </Surface>
      </div>
    </main>
  )
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm text-neutral-400">
      {icon}
      <span>
        <span className="block">{label}</span>
        <strong className="font-mono text-white">{value}</strong>
      </span>
    </div>
  )
}

function Party({
  label,
  confirmed,
  align,
}: {
  label: string
  confirmed: boolean
  align?: "right"
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="vouch-label text-white">{label}</p>
      <p className={confirmed ? "text-green-400" : "text-neutral-400"}>
        {confirmed ? "Confirmed" : "Not confirmed"}
      </p>
    </div>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-800 py-2">
      <span className="text-neutral-300">{label}</span>
      <span className={strong ? "text-blue-500" : "text-white"}>{value}</span>
    </div>
  )
}
