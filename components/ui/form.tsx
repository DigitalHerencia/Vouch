import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Form({ className, ...props }: ComponentProps<"form">) {
  return <form className={cn("grid gap-4", className)} {...props} />
}

function FormActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("grid gap-3 border-t border-neutral-800 pt-4 sm:flex sm:items-center", className)}
      {...props}
    />
  )
}

export { Form, FormActions }
