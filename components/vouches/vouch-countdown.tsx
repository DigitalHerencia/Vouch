import { Progress } from "@/components/ui/progress"
import { VouchStatusBadge, type VouchStatusTone } from "@/components/vouches/vouch-status-badge"

export type VouchCountdownProps = {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
}

export function VouchCountdown({
  label,
  expiresAtLabel,
  remainingLabel,
  percentRemaining = 0,
  tone = "active",
}: VouchCountdownProps) {
  const clamped = Math.max(0, Math.min(100, percentRemaining))

  return (
    <div className="border-3 border-neutral-400 bg-black p-4 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
          <p className="mt-2 font-mono text-3xl leading-none font-black text-white uppercase">
            {remainingLabel}
          </p>
        </div>
        <VouchStatusBadge status={tone} tone={tone} />
      </div>
      <Progress value={clamped} className="h-4 shadow-none" />
      <p className="mt-3 text-xs leading-5 font-bold text-neutral-400 uppercase">
        Expires {expiresAtLabel}
      </p>
    </div>
  )
}
