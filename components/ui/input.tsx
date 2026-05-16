import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-none border border-neutral-700 bg-black/70 px-3.5 py-2 text-base font-semibold text-white transition-colors outline-none placeholder:text-neutral-600",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/35",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-950 disabled:text-neutral-500 disabled:opacity-70",
        "aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-500/25 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
