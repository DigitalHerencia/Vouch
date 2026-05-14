import { ArrowRight, CalendarDays, CheckCircle2, Clock, Info, UserRound } from "lucide-react"
import type { ReactNode } from "react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { vouchPageCopy } from "@/content/vouches"
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
  const copy = vouchPageCopy.detail
  const heroBody = `${amountLabel} ${copy.heroBody.replace("{appointmentLabel}", appointmentLabel)}`

  return (
    <main className="grid w-full gap-8">
      <section className="grid min-h-[360px] content-end border-b border-neutral-800 pb-8">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-none bg-primary text-primary-foreground">{statusLabel}</Badge>
            <Badge className="rounded-none border border-neutral-700 bg-neutral-950 text-neutral-200">
              {currentUserRoleLabel}
            </Badge>
          </div>
          <SectionIntro className="mt-5" title={copy.title} />
          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">
            {heroBody}
          </p>
          <p className="mt-5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-neutral-500">
            {title} / {vouchId}
          </p>
        </div>
      </section>

      <section className="grid gap-4 border-y border-neutral-800 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBlock icon={<UserRound />} label={copy.labels.merchant} value={merchantLabel} />
        <InfoBlock icon={<UserRound />} label={copy.labels.customer} value={customerLabel} />
        <InfoBlock icon={<CalendarDays />} label={copy.labels.amount} value={amountLabel} />
        <InfoBlock icon={<Clock />} label={copy.labels.window} value={windowLabel} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Surface variant="muted">
          <SurfaceHeader>
            <h2 className="text-[26px] leading-none text-white">{copy.sections.confirmation}</h2>
          </SurfaceHeader>
          <SurfaceBody>
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Party label={copy.labels.merchant} confirmed={confirmation.merchantConfirmed} />
              <div className="grid size-28 place-items-center border-4 border-primary text-center font-mono text-sm text-white">
                {confirmation.merchantConfirmed && confirmation.customerConfirmed
                  ? copy.states.bothConfirmed
                  : copy.states.waiting}
              </div>
              <Party label={copy.labels.customer} confirmed={confirmation.customerConfirmed} align="right" />
            </div>
            {confirmation.canConfirm ? <div className="mt-7">{confirmation.action}</div> : null}
            <p className="mt-4 border border-neutral-800 p-3 text-sm text-neutral-400">
              <Info className="mr-2 inline size-4 text-primary" />
              {copy.oneSidedRule}
            </p>
          </SurfaceBody>
        </Surface>

        <div className="grid gap-5">
          <Surface variant="muted">
            <SurfaceHeader>
              <h2 className="text-[26px] leading-none text-white">{copy.sections.schedule}</h2>
            </SurfaceHeader>
            <SurfaceBody className="font-mono text-sm">
              <Line label={copy.labels.appointment} value={appointmentLabel} />
              <Line label={copy.labels.opens} value={windowLabel} />
              <Line label={copy.labels.expires} value={deadlineLabel} />
            </SurfaceBody>
          </Surface>
          <Surface variant="muted">
            <SurfaceHeader>
              <h2 className="text-[26px] leading-none text-white">{copy.sections.payment}</h2>
            </SurfaceHeader>
            <SurfaceBody className="font-mono text-sm">
              <Line label={copy.labels.vouchAmount} value={amountLabel} />
              <Line label={copy.labels.merchantReceives} value={merchantReceivesLabel} />
              <Line label={copy.labels.customerAuthorizes} value={customerTotalLabel} strong />
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
            <h2 className="text-[26px] leading-none text-white">{copy.sections.timeline}</h2>
          </SurfaceHeader>
          <SurfaceBody className="space-y-4">
            {timeline.length ? (
              timeline.map((event) => (
                <div
                  key={`${event.label}-${event.timestampLabel}`}
                  className="grid grid-cols-[20px_1fr_auto] gap-3 text-sm"
                >
                  <CheckCircle2 className="size-5 text-primary" />
                  <span className="text-white">{event.label}</span>
                  <span className="font-mono text-neutral-400">{event.timestampLabel}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">{copy.states.noTimeline}</p>
            )}
          </SurfaceBody>
        </Surface>
        <Surface variant="muted">
          <SurfaceHeader className="flex items-center justify-between gap-4">
            <h2 className="text-[26px] leading-none text-white">{copy.sections.rule}</h2>
            <ArrowRight className="size-5 text-primary" />
          </SurfaceHeader>
          <SurfaceBody className="text-sm leading-7 text-neutral-400">
            {copy.ruleDescription}
          </SurfaceBody>
        </Surface>
      </div>
    </main>
  )
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm text-neutral-400">
      <span className="text-primary">{icon}</span>
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
        {confirmed ? vouchPageCopy.detail.states.confirmed : vouchPageCopy.detail.states.notConfirmed}
      </p>
    </div>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-800 py-2">
      <span className="text-neutral-300">{label}</span>
      <span className={strong ? "text-primary" : "text-white"}>{value}</span>
    </div>
  )
}
