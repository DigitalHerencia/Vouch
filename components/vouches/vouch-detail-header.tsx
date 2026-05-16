import { SectionIntro } from "@/components/shared/section-intro"
import { Badge } from "@/components/ui/badge"
import type { VouchStatus } from "@/types/vouch"

export interface VouchDetailHeaderProps {
  vouchId: string
  title: string
  amountLabel: string
  appointmentLabel: string
  statusLabel: VouchStatus | string
  currentUserRoleLabel: "merchant" | "customer" | "participant"
  copy: {
    title: string
    heroBody: string
  }
}

export function VouchDetailHeader({
  vouchId,
  title,
  amountLabel,
  appointmentLabel,
  statusLabel,
  currentUserRoleLabel,
  copy,
}: VouchDetailHeaderProps) {
  const heroBody = `${amountLabel} ${copy.heroBody.replace("{appointmentLabel}", appointmentLabel)}`

  return (
    <section className="grid min-h-[360px] content-end border-b border-neutral-800 pb-8">
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-none bg-primary text-primary-foreground">{statusLabel}</Badge>
          <Badge className="rounded-none border border-neutral-700 bg-neutral-950 text-neutral-200">
            {currentUserRoleLabel}
          </Badge>
        </div>
        <SectionIntro className="mt-5" title={copy.title} />
        <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">{heroBody}</p>
        <p className="mt-5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-neutral-500">
          {title} / {vouchId}
        </p>
      </div>
    </section>
  )
}
