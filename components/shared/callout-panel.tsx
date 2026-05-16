import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function CalloutPanel({ title, body, icon: Icon, actions, className }: { title: ReactNode; body?: ReactNode; icon?: LucideIcon; actions?: ReactNode; className?: string }) {
  return (
    <Alert className={cn("rounded-none border border-neutral-700 bg-black/80 p-5 text-white sm:p-6", className)}>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start lg:grid-cols-[auto_1fr_auto]">
        {Icon ? <Icon className="size-10 text-white" strokeWidth={1.7} /> : null}
        <div>
          <AlertTitle className="text-3xl font-semibold uppercase leading-none tracking-tight text-white">{title}</AlertTitle>
          {body ? <AlertDescription className="mt-2 text-sm font-semibold leading-6 text-neutral-400">{body}</AlertDescription> : null}
        </div>
        {actions ? <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">{actions}</div> : null}
      </div>
    </Alert>
  )
}
