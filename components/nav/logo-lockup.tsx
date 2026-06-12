type LogoLockupProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
}

// components/nav/logo-lockup.tsx

import { Handshake } from "lucide-react"
import { publicNavigationContent } from "@/content/navigation"

export function LogoLockup({ className, iconClassName, textClassName }: LogoLockupProps) {
  return (
    <span
      className={["inline-flex items-center gap-2.5 text-white", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={publicNavigationContent.brand}
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
        {publicNavigationContent.brand}
      </span>
    </span>
  )
}
