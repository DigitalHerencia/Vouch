"use client"

import * as React from "react"

import { Progress } from "@/components/ui/progress"
import { VouchStatusBadge, type VouchStatusTone } from "@/components/shared/vouch-status-badge"

export type VouchCountdownProps = {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  startsAt?: string
  expiresAt?: string
  percentRemaining?: number
  tone?: VouchStatusTone
}

export function VouchCountdown({
  label,
  expiresAtLabel,
  remainingLabel,
  startsAt,
  expiresAt,
  percentRemaining = 0,
  tone = "active",
}: VouchCountdownProps) {
  const [now, setNow] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!expiresAt) return
    const initial = window.setTimeout(() => setNow(Date.now()), 0)
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [expiresAt])

  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : null
  const startsAtMs = startsAt ? new Date(startsAt).getTime() : null
  const dynamicRemaining =
    now !== null && expiresAtMs !== null ? formatRemaining(expiresAtMs - now) : remainingLabel
  const dynamicPercent =
    now !== null && expiresAtMs !== null && startsAtMs !== null && expiresAtMs > startsAtMs
      ? ((expiresAtMs - now) / (expiresAtMs - startsAtMs)) * 100
      : percentRemaining
  const clamped = Math.max(0, Math.min(100, dynamicPercent))
  const dynamicTone = now !== null && expiresAtMs !== null && now > expiresAtMs ? "expired" : tone

  return (
    <div className="border-3 border-neutral-400 bg-black p-4 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
          <p className="mt-2 font-mono text-3xl leading-none font-black text-white uppercase">
            {dynamicRemaining}
          </p>
        </div>
        <VouchStatusBadge status={dynamicTone} tone={dynamicTone} />
      </div>
      <Progress value={clamped} className="h-4 shadow-none" />
      <p className="mt-3 text-xs leading-5 font-bold text-neutral-400 uppercase">
        Expires {expiresAtLabel}
      </p>
    </div>
  )
}

function formatRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return "Window closed"

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
