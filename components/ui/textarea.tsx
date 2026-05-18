import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-input bg-background placeholder:text-muted-foreground flex min-h-25 w-full border-3 px-4 py-3 text-base shadow-[4px_4px_0px_hsl(var(--shadow-color))] transition-all duration-200 focus-visible:translate-x-1 focus-visible:translate-y-1 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
