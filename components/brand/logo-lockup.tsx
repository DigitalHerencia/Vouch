// components/brand/logo-lockup.tsx

import { Handshake } from "lucide-react"

export function LogoLockup({ className, iconClassName, textClassName }: LogoLockupProps) {
  return (
    <span
      className={["inline-flex items-center gap-2.5 text-white", className]
        .filter(Boolean)
        .join(" ")}
      aria-label="Vouch"
    >
      <Handshake
        className={["size-7 text-blue-600 sm:size-8 lg:size-9", iconClassName]
          .filter(Boolean)
          .join(" ")}
        strokeWidth={2.4}
      />

      <span
        className={[
          "font-(family-name:--font-brand) text-[22px] leading-none tracking-normal text-white uppercase sm:text-[28px] lg:text-[34px]",
          textClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Vouch
      </span>
    </span>
  )
}

export function MarqueeLogo({ className, iconClassName, textClassName }: LogoLockupProps) {
  return (
    <span
      className={["inline-flex items-center gap-2.5 text-black", className]
        .filter(Boolean)
        .join(" ")}
      aria-label="Vouch"
    >
      <Handshake
        className={["size-12 text-blue-600 sm:size-14 lg:size-16", iconClassName]
          .filter(Boolean)
          .join(" ")}
        strokeWidth={2.4}
      />

      <span
        className={[
          "font-(family-name:--font-brand) text-[44px] leading-none tracking-normal text-black uppercase sm:text-[56] lg:text-[64px]",
          textClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Vouch
      </span>
    </span>
  )
}
