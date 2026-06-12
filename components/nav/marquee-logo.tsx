import { Handshake } from "lucide-react"
import { publicNavigationContent } from "@/content/navigation"

type MarqueeLogoProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function MarqueeLogo({ className, iconClassName, textClassName }: MarqueeLogoProps) {
  return (
    <span
      className={["inline-flex items-center gap-2.5 text-black", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={publicNavigationContent.brand}
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
        {publicNavigationContent.brand}
      </span>
    </span>
  )
}
