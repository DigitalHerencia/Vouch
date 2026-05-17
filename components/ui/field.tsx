import * as React from "react"

import { cn } from "@/lib/utils"

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("space-y-2.5", className)} {...props} />
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("space-y-5", className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-white uppercase",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs leading-5 font-semibold text-neutral-400", className)}
      {...props}
    />
  )
}

function FieldError({ className, errors, ...props }: React.ComponentProps<"div"> & { errors?: Array<{ message?: string }> | undefined }) {
  const message = errors?.find((error) => error.message)?.message
  if (!message) return null
  return <div data-slot="field-error" className={cn("text-xs leading-5 font-semibold text-red-300", className)} {...props}>{message}</div>
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel }
