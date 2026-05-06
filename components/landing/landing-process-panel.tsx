// components/shared/process-panel.tsx

import type { LucideIcon } from "lucide-react"

import { Surface, SurfaceFooter, SurfaceHeader } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface ProcessStep {
  number: string
  title: string
  body: string
  icon: LucideIcon
}

export interface ProcessPanelProps {
  title: string
  steps: ProcessStep[]
  footer?: string | undefined
  className?: string | undefined
}

export function LandingProcessPanel({ title, steps, footer, className }: ProcessPanelProps) {
  return (
    <Surface as="aside" className={cn("w-full", className)}>
      <SurfaceHeader>
        <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
          {title}
        </p>
      </SurfaceHeader>

      <div>
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={`${step.number}-${step.title}`}
              className="grid min-h-31 grid-cols-[1fr_92px] border-b border-neutral-800 sm:grid-cols-[1fr_124px] lg:min-h-34"
            >
              <div className="flex items-center gap-5 px-5 py-5 sm:gap-6 sm:px-7">
                <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-11 sm:text-lg">
                  {step.number}
                </div>

                <div>
                  <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.07em] text-white uppercase sm:text-3xl lg:text-[34px]">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-65 text-base leading-tight font-semibold text-neutral-400 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-9 text-white sm:size-10" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      {footer ? <SurfaceFooter variant="blue">{footer}</SurfaceFooter> : null}
    </Surface>
  )
}
