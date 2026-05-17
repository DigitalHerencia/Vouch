import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-none border border-neutral-700 bg-black/70 px-4 py-3 text-base font-semibold text-white transition-colors outline-none placeholder:text-neutral-600 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-950 disabled:text-neutral-500 disabled:opacity-70 aria-invalid:border-red-400 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
