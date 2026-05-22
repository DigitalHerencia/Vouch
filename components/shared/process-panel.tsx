import type { LucideIcon } from "lucide-react"

export interface ProcessPanelStep {
  number: string
  title: string
  body: string
  icon: LucideIcon
}

export interface ProcessPanelProps {
  title: string
  steps: readonly ProcessPanelStep[]
  footer?: string | undefined
  id?: string | undefined
}

export function ProcessPanel({ title, steps, footer, id }: ProcessPanelProps) {
  return (
    <aside id={id} className="min-w-lg border border-neutral-400 bg-black backdrop-blur-[2px]">
      <div className="border-b border-neutral-400 px-6 py-6">
        <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
          {title}
        </p>
      </div>

      <div>
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={`${step.number}-${step.title}`}
              className="grid min-h-31 min-w-0 grid-cols-[minmax(0,1fr)_72px] border-b border-neutral-400 sm:grid-cols-[minmax(0,1fr)_124px] lg:min-h-34"
            >
              <div className="flex min-w-0 items-center gap-4 px-4 py-5 sm:gap-6 sm:px-7">
                <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-400 font-mono text-base font-black text-white sm:size-11 sm:text-lg">
                  {step.number}
                </div>

                <div className="min-w-0">
                  <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.07em] text-white uppercase sm:text-3xl lg:text-[34px]">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-65 text-base leading-tight font-semibold text-neutral-400 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-400">
                <Icon className="size-8 text-white sm:size-10" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      {footer ? (
        <div className="bg-blue-600 px-5 py-5 text-center font-(family-name:--font-display) text-sm leading-tight tracking-widest text-white uppercase sm:text-base lg:text-lg">
          {footer}
        </div>
      ) : null}
    </aside>
  )
}
