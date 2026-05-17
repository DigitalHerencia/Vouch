import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function CalloutPanel({ title, body, icon: Icon, actions, className }: { title: ReactNode; body?: ReactNode; icon?: LucideIcon; actions?: ReactNode; className?: string }) {
  return (
    <Alert className={cn("rounded-none border border-neutral-700 bg-black p-5 text-white shadow-[6px_6px_0_0_#1d4ed8] sm:p-6", className)}>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start lg:grid-cols-[auto_1fr_auto]">
        {Icon ? <Icon className="size-10 text-white" strokeWidth={1.7} /> : null}
        <div>
          <AlertTitle className="font-(family-name:--font-display) text-3xl leading-none tracking-[0.04em] text-white uppercase">{title}</AlertTitle>
          {body ? <AlertDescription className="mt-2 text-sm leading-6 font-bold text-neutral-400">{body}</AlertDescription> : null}
        </div>
        {actions ? <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">{actions}</div> : null}
      </div>
    </Alert>
  )
}
