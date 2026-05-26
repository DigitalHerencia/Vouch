import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border-3 border-neutral-400 bg-black px-4 py-2 text-base shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 file:border-0 file:bg-black file:text-sm file:font-medium file:text-white placeholder:text-neutral-400 focus-visible:translate-x-1 focus-visible:translate-y-1 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
