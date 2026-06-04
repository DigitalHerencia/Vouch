import { ShieldCheck } from "lucide-react"

import { ConfirmStateTile } from "@/components/vouches/confirm-state-tile"

export function ConfirmationProtocolCard({
  merchantConfirmed,
  customerConfirmed,
  action,
}: VouchStatusDocumentData["confirmations"]) {
  return (
    <section className="border-3 border-neutral-400 bg-black p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black tracking-wide uppercase">Presence confirmation</h3>
        <ShieldCheck className="size-5 text-blue-600" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConfirmStateTile label="Merchant" confirmed={merchantConfirmed} />
        <ConfirmStateTile label="Customer" confirmed={customerConfirmed} />
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}
