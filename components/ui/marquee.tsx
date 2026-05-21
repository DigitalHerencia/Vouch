import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "left" | "right"
  speed?: "slow" | "normal" | "fast"
}

const durations = {
  slow: "40s",
  normal: "25s",
  fast: "15s",
}

export function Marquee({
  children,
  className,
  direction = "left",
  speed = "normal",
  ...props
}: MarqueeProps) {
  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      <div
        className={cn(
          "flex w-max min-w-full items-center motion-reduce:animate-none",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
        style={{ "--marquee-duration": durations[speed] } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
