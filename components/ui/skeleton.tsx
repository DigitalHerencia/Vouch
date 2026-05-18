import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted border-foreground/20 animate-pulse border-2", className)}
      {...props}
    />
  )
}

export { Skeleton }
