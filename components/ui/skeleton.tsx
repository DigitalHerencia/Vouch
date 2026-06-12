import * as React from "react"
import { cn } from "@/lib/utils/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse border-2 border-neutral-400 bg-neutral-900", className)}
      {...props}
    />
  )
}

export { Skeleton }
