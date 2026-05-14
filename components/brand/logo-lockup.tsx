// components/brand/logo-lockup.tsx

import { Handshake } from "lucide-react"

import { cn } from "@/lib/utils"

export interface LogoLockupProps {
  className?: string
  iconClassName?: string
  wordmarkClassName?: string
}

export function LogoLockup({ className, iconClassName, wordmarkClassName }: LogoLockupProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-white", className)}
      aria-label="Vouch"
    >
      <Handshake
        className={cn("size-7 text-primary sm:size-8 lg:size-9", iconClassName)}
        strokeWidth={2.4}
      />

      <span
        className={cn(
          "font-(family-name:--font-brand) text-[22px] leading-none tracking-[-0.045em] text-white uppercase sm:text-[28px] lg:text-[34px]",
          wordmarkClassName
        )}
      >
        Vouch
      </span>
    </span>
  )
}
