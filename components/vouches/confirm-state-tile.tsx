import { Check, Clock } from "lucide-react"

export function ConfirmStateTile({ label, confirmed }: { label: string; confirmed: boolean }) {
  return (
    <div className="border border-neutral-400 bg-neutral-900 p-3">
      <p className="text-[11px] font-black tracking-widest text-neutral-400 uppercase">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-black uppercase">
        {confirmed ? <Check className="size-4 text-blue-600" /> : <Clock className="size-4" />}
        {confirmed ? "Confirmed" : "Waiting"}
      </p>
    </div>
  )
}
