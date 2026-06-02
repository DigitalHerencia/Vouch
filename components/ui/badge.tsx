import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 border-neutral-400 px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white",
        secondary: "bg-neutral-900 text-white",
        accent: "bg-blue-600 text-white",
        destructive: "bg-red-600 text-white",
        success: "bg-blue-600 text-white",
        warning: "bg-blue-600 text-white",
        info: "bg-blue-600 text-white",
        outline: "bg-black text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
