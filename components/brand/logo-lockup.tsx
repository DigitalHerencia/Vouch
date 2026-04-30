import Image from "next/image"

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
    <div className={cn("inline-flex items-center gap-2 text-neutral-50", className)} aria-label="Vouch">
      <div
        className={cn(
          "grid size-8 place-items-center",
          markClassName
        )}
      >
        <Image src="/handshake.svg" alt="" width={32} height={32} className="size-8" />
      </div>

      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-2xl leading-none font-black tracking-normal text-white",
            wordmarkClassName
          )}
        >
          Vouch
        </span>
      ) : null}
    </div>
  )
}
