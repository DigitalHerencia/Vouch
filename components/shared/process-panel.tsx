import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ProcessPanelStep {
  number: string
  title: string
  body: string
  icon: LucideIcon
}

export interface ProcessPanelProps {
  title: string
  steps: readonly ProcessPanelStep[]
  footer: string
  id?: string | undefined
  className?: string | undefined
}

export function ProcessPanel({ title, steps, footer, id, className }: ProcessPanelProps) {
  return (
    <Card id={id} className={cn("min-w-0 rounded-none border-neutral-700 bg-black shadow-[6px_6px_0_0_#1d4ed8]", className)}>
      <CardHeader className="border-neutral-700 px-5 py-5 sm:px-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid grid-cols-[3.75rem_minmax(0,1fr)_4.5rem] items-center border-b border-neutral-800 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_6.5rem]"
            >
              <div className="grid place-items-center px-4">
                <span className="grid size-10 place-items-center border border-neutral-700 text-sm font-semibold text-white sm:size-11">
                  {step.number}
                </span>
              </div>
              <div className="min-w-0 px-3 py-6 sm:px-5">
                <h2 className="font-(family-name:--font-display) text-3xl leading-none tracking-[0.04em] text-white uppercase sm:text-4xl">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 font-bold text-neutral-400">
                  {step.body}
                </p>
              </div>
              <div className="grid h-full place-items-center border-l border-neutral-800 px-4">
                <Icon className="size-7 text-white sm:size-8" />
              </div>
            </div>
          )
        })}
        <div className="border-t border-neutral-800 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white sm:px-6">
          {footer}
        </div>
      </CardContent>
    </Card>
  )
}
