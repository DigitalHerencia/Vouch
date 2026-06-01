"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const TimelineContext = React.createContext<TimelineContextValue>({
  orientation: "vertical",
})

function useTimeline() {
  return React.useContext(TimelineContext)
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ orientation = "vertical", className, children, ...props }, ref) => {
    return (
      <TimelineContext.Provider value={{ orientation }}>
        <div
          ref={ref}
          className={cn(
            "relative",
            orientation === "vertical" ? "flex flex-col" : "flex flex-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TimelineContext.Provider>
    )
  }
)
Timeline.displayName = "Timeline"

// Timeline Item
const timelineItemVariants = cva("relative flex")

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ status, className, children, ...props }, ref) => {
    const { orientation } = useTimeline()

    return (
      <div
        ref={ref}
        data-status={status}
        className={cn(
          timelineItemVariants(),
          orientation === "vertical" ? "flex-row gap-4" : "flex-col items-center gap-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineItem.displayName = "TimelineItem"

// Timeline Dot
const timelineDotVariants = cva(
  "relative z-10 flex items-center justify-center border-3 border-neutral-400 transition-all duration-200",
  {
    variants: {
      status: {
        completed: "bg-blue-600 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]",
        current: "scale-110 bg-blue-600 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]",
        upcoming: "bg-neutral-900",
      },
      size: {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      status: "upcoming",
      size: "md",
    },
  }
)

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ status, size, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(timelineDotVariants({ status, size }), className)} {...props}>
        {children}
      </div>
    )
  }
)
TimelineDot.displayName = "TimelineDot"

// Timeline Connector
const timelineConnectorVariants = cva("transition-all duration-200", {
  variants: {
    status: {
      completed: "bg-neutral-900",
      current: "bg-neutral-900",
      upcoming: "border-2 border-dashed border-neutral-400 bg-black",
    },
    orientation: {
      vertical: "ml-[14px] min-h-8 w-[3px]",
      horizontal: "mt-[14px] h-[3px] min-w-8",
    },
  },
  defaultVariants: {
    status: "upcoming",
    orientation: "vertical",
  },
})

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ status, className, ...props }, ref) => {
    const { orientation } = useTimeline()

    return (
      <div
        ref={ref}
        className={cn(timelineConnectorVariants({ status, orientation }), className)}
        {...props}
      />
    )
  }
)
TimelineConnector.displayName = "TimelineConnector"

// Timeline Content
const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useTimeline()

    return (
      <div
        ref={ref}
        className={cn("flex-1", orientation === "vertical" ? "pb-8" : "pr-8", className)}
        {...props}
      />
    )
  }
)
TimelineContent.displayName = "TimelineContent"

// Timeline Header
const TimelineHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  }
)
TimelineHeader.displayName = "TimelineHeader"

// Timeline Title
const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-base font-bold tracking-wide uppercase", className)}
      {...props}
    />
  )
})
TimelineTitle.displayName = "TimelineTitle"

// Timeline Description
const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("mt-1 text-sm text-neutral-400", className)} {...props} />
})
TimelineDescription.displayName = "TimelineDescription"

// Timeline Time
const TimelineTime = React.forwardRef<HTMLTimeElement, React.TimeHTMLAttributes<HTMLTimeElement>>(
  ({ className, ...props }, ref) => {
    return (
      <time
        ref={ref}
        className={cn("text-xs font-medium text-neutral-400", className)}
        {...props}
      />
    )
  }
)
TimelineTime.displayName = "TimelineTime"

// Timeline Card - convenience wrapper
const TimelineCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-3 border-neutral-400 bg-black p-4",
          "shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]",
          className
        )}
        {...props}
      />
    )
  }
)
TimelineCard.displayName = "TimelineCard"

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineCard,
  timelineItemVariants,
  timelineDotVariants,
  timelineConnectorVariants,
}
