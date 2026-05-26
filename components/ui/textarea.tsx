import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-25 w-full border-3 border-neutral-400 bg-black px-4 py-3 text-base shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 placeholder:text-neutral-400 focus-visible:translate-x-1 focus-visible:translate-y-1 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
