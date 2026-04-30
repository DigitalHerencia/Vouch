import Image from "next/image"

import { cn } from "@/lib/utils"

export interface LogoLockupProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showWordmark?: boolean
  variant?: "lockup" | "mark-word"
}

export function LogoLockup({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  variant = "lockup",
}: LogoLockupProps) {
  if (variant === "lockup") {
    return (
      <div className={cn("inline-flex items-center", className)} aria-label="Vouch">
        <Image
          src="/VOUCHdark.png"
          alt="Vouch"
          width={240}
          height={80}
          priority
          className={cn("h-10 w-auto object-contain", wordmarkClassName)}
        />
      </div>
    )
  }

  return (
    <div className={cn("inline-flex items-center gap-3 text-white", className)} aria-label="Vouch">
      <Image
        src="/handshake.png"
        alt=""
        width={40}
        height={40}
        priority
        className={cn("size-10 object-contain", markClassName)}
      />

      {showWordmark ? (
        <span
          className={cn(
            "font-[family-name:var(--font-brand)] text-2xl leading-none font-black tracking-tight text-white uppercase",
            wordmarkClassName
          )}
        >
          Vouch
        </span>
      ) : null}
    </div>
  )
}
