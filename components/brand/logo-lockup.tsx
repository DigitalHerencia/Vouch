import { ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export interface LogoLockupProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showWordmark?: boolean
}

export function LogoLockup({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
}: LogoLockupProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-3 text-neutral-50", className)}
      aria-label="Vouch"
    >
      <div
        className={cn(
          "grid size-10 place-items-center rounded-xl border border-neutral-700 bg-neutral-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
          markClassName
        )}
      >
        <ShieldCheck aria-hidden="true" className="size-5 stroke-[2.25] text-blue-500" />
      </div>

      {showWordmark ? (
        <span
          className={cn(
            "font-sans text-[1.35rem] font-semibold tracking-[-0.045em]",
            wordmarkClassName
          )}
        >
          Vouch
        </span>
      ) : null}
    </div>
  )
}
