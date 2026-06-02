import * as React from "react"
import { cn } from "@/lib/utils"

const speedClasses = {
  slow: "animate-marquee-slow",
  normal: "animate-marquee",
  fast: "animate-marquee-fast",
}

const reverseSpeedClasses = {
  slow: "animate-marquee-slow-reverse",
  normal: "animate-marquee-reverse",
  fast: "animate-marquee-fast-reverse",
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      children,
      direction = "left",
      speed = "normal",
      pauseOnHover = true,
      bordered = true,
      repeat = 4,
      ...props
    },
    ref
  ) => {
    const animationClass = direction === "right" ? reverseSpeedClasses[speed] : speedClasses[speed]

    return (
      <div
        ref={ref}
        className={cn(
          "flex overflow-hidden will-change-transform contain-[layout_paint]",
          bordered && "border-3 border-neutral-400 bg-black",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "marquee-content flex shrink-0 items-center gap-8 py-3 will-change-transform",
            animationClass,
            pauseOnHover && "hover:paused"
          )}
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
        </div>
        <div
          className={cn(
            "marquee-content flex shrink-0 items-center gap-8 py-3 will-change-transform",
            animationClass,
            pauseOnHover && "hover:paused"
          )}
          aria-hidden="true"
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
Marquee.displayName = "Marquee"

const MarqueeItem = React.forwardRef<HTMLSpanElement, MarqueeItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-4 text-lg font-bold tracking-wide whitespace-nowrap uppercase",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
MarqueeItem.displayName = "MarqueeItem"

const MarqueeSeparator = React.forwardRef<HTMLSpanElement, MarqueeSeparatorProps>(
  ({ className, children = "/", ...props }, ref) => {
    return (
      <span ref={ref} className={cn("text-2xl font-black text-neutral-400", className)} {...props}>
        {children}
      </span>
    )
  }
)
MarqueeSeparator.displayName = "MarqueeSeparator"

export { Marquee, MarqueeItem, MarqueeSeparator }
