import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
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
}

export function ProcessPanel({ title, steps, footer, id }: ProcessPanelProps) {
  return (
    <Card id={id} className="border border-neutral-700 bg-neutral-950">
      <CardHeader className="border-b border-neutral-700 px-5 py-5 text-center">
        <CardTitle className="font-brand text-center text-3xl font-bold text-neutral-100 uppercase md:text-4xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid grid-cols-[3.75rem_minmax(0,1fr)_4.5rem] items-center md:grid-cols-[4.5rem_minmax(0,1fr)_6.5rem]"
            >
              <div className="grid place-items-center">
                <span className="text-md border border-neutral-700 px-4 py-2 font-mono font-bold text-neutral-100 md:text-lg">
                  {step.number}
                </span>
              </div>
              <div className="px-3 py-6 md:px-5">
                <h3 className="font-brand text-3xl leading-none tracking-normal text-neutral-100 uppercase md:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-base text-neutral-400">{step.body}</p>
              </div>
              <div className="place-items-center px-4">
                <Icon className="h-8 w-8 text-neutral-100" />
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter>
        <h3 className="font-brand text-center text-sm font-black tracking-normal text-neutral-100 uppercase md:text-lg">
          {footer}
        </h3>
      </CardFooter>
    </Card>
  )
}
