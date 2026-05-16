import type { ReactNode } from "react"
import { Info } from "lucide-react"

import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { vouchPageCopy } from "@/content/vouches"

export interface ConfirmationPanelProps {
  merchantConfirmed: boolean
  customerConfirmed: boolean
  canConfirm: boolean
  action?: ReactNode
}

export function ConfirmationPanel({
  merchantConfirmed,
  customerConfirmed,
  canConfirm,
  action,
}: ConfirmationPanelProps) {
  const copy = vouchPageCopy.detail

  return (
    <Surface variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">{copy.sections.confirmation}</h2>
      </SurfaceHeader>
      <SurfaceBody>
        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Party label={copy.labels.merchant} confirmed={merchantConfirmed} />
          <div className="grid size-28 place-items-center border-4 border-primary text-center font-mono text-sm text-white">
            {merchantConfirmed && customerConfirmed ? copy.states.bothConfirmed : copy.states.waiting}
          </div>
          <Party label={copy.labels.customer} confirmed={customerConfirmed} align="right" />
        </div>
        {canConfirm ? <div className="mt-7">{action}</div> : null}
        <p className="mt-4 border border-neutral-800 p-3 text-sm text-neutral-400">
          <Info className="mr-2 inline size-4 text-primary" />
          {copy.oneSidedRule}
        </p>
      </SurfaceBody>
    </Surface>
  )
}

function Party({ label, confirmed, align }: { label: string; confirmed: boolean; align?: "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="vouch-label text-white">{label}</p>
      <p className={confirmed ? "text-green-400" : "text-neutral-400"}>
        {confirmed ? vouchPageCopy.detail.states.confirmed : vouchPageCopy.detail.states.notConfirmed}
      </p>
    </div>
  )
}
