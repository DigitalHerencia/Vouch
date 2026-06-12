type ProcessPanelStep = {
  number?: string
  label?: string
  value?: string
  title?: string
  body?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

type ProcessPanelProps = {
  title?: string
  steps: readonly ProcessPanelStep[]
  footer?: string | React.ReactNode
  id?: string
}

type ProcessPanelListProps = {
  title?: string
  items: readonly ProcessPanelStep[]
  eyebrow?: string
  body?: string
  id?: string
}

type ProcessPanelCalloutProps = {
  title?: string
  body?: string
  action?: React.ReactNode
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  id?: string
}

type ProcessPanelGridItem = { name: string; logo: React.ReactNode; detail?: string }

type ProcessPanelGridProps = {
  title?: string
  subtitle?: string
  logos: readonly ProcessPanelGridItem[]
  footer?: string
}

import * as React from "react"
import { CardHeader, Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"

export function ProcessPanel({ title, steps, footer, id }: ProcessPanelProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <Card id={id} className="w-full border-3 border-neutral-400 bg-black">
          <CardHeader className="items-center border-b-3 border-neutral-400 px-6 py-6 text-center md:px-8">
            <CardTitle className="text-6xl leading-none font-black tracking-wide text-white">
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <section
                  key={`${step.number}-${step.title}`}
                  className="border-b-3 border-neutral-400 last:border-b-0"
                >
                  <div className="grid min-h-31 min-w-0 grid-cols-[minmax(0,1fr)_7rem] md:min-h-34 md:grid-cols-[minmax(0,1fr)_140px]">
                    <div className="flex min-w-0 items-center gap-4 px-4 py-5 md:gap-6 md:px-7">
                      <div className="flex size-18 shrink-0 items-center justify-center border-3 border-neutral-400 md:size-22">
                        <h2 className="font-extrabold">{step.number}</h2>
                      </div>

                      <div>
                        <h3 className="tracking-normal text-white">{step.title}</h3>
                        <p className="font-semibold text-neutral-400">{step.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center border-l-3 border-neutral-400">
                      {Icon ? (
                        <Icon className="size-14 text-white md:size-16" strokeWidth={1.8} />
                      ) : null}
                    </div>
                  </div>
                </section>
              )
            })}
          </CardContent>

          {footer ? (
            <CardFooter className="justify-center bg-blue-600 px-6 py-6 text-center">
              <h3 className="font-black tracking-wide text-white">{footer}</h3>
            </CardFooter>
          ) : null}
        </Card>
      </section>
    </main>
  )
}

export function ProcessPanelList({ title, items, eyebrow, body, id }: ProcessPanelListProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <Card id={id} className="w-full border-3 border-neutral-400 bg-black">
          <CardHeader className="border-b-3 border-neutral-400 px-12 py-6">
            {eyebrow ? (
              <p className="text-lg font-black tracking-widest text-blue-600 uppercase md:text-base">
                {eyebrow}
              </p>
            ) : null}
            <CardTitle className="text-6xl leading-none tracking-wide text-white">
              {title}
            </CardTitle>
            {body ? <p className="font-semibold tracking-tight text-neutral-400">{body}</p> : null}
          </CardHeader>

          <CardContent>
            {items.map((item) => (
              <section key={`${item.number}-${item.title}`} className="px-6 py-6">
                <h3 className="tracking-normal text-white">
                  {item.number}. {item.title}
                </h3>
                <p className="font-semibold text-neutral-400">{item.body}</p>
              </section>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export function ProcessPanelCallout({
  title,
  body,
  action,
  icon: Icon,
  id,
}: ProcessPanelCalloutProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <Card id={id} className="w-full min-w-0 border-3 border-neutral-400 bg-black shadow-none">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:p-8">
            <div className="flex size-18 items-center justify-center border-3 border-neutral-400">
              <Icon className="size-10 text-white" strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="tracking-normal text-white">{title}</h3>
              <p className="mt-2 font-semibold text-neutral-400">{body}</p>
            </div>

            <div className="flex min-h-16 items-center justify-center bg-blue-600 px-8 text-center">
              <h4 className="font-black tracking-wide text-white">{action}</h4>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export function ProcessPanelGrid({ title, subtitle, footer }: ProcessPanelGridProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <Card className="w-full overflow-hidden border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
          {(title || subtitle) && (
            <CardHeader className="border-b-3 border-neutral-400 px-5 py-6 md:px-8 md:py-8">
              {subtitle ? (
                <p className="font-(family-name:--font-display) text-sm font-black tracking-widest text-blue-600 uppercase md:text-base">
                  {subtitle}
                </p>
              ) : null}
              {title ? (
                <CardTitle>
                  <span className="block max-w-xl text-2xl leading-none font-black tracking-wide text-white uppercase md:text-4xl">
                    {title}
                  </span>
                </CardTitle>
              ) : null}
            </CardHeader>
          )}

          {footer ? (
            <CardFooter className="border-t-3 border-neutral-400 bg-blue-600 px-5 py-5 md:px-8">
              <h3 className="leading-none font-black tracking-wide text-white">{footer}</h3>
            </CardFooter>
          ) : null}
        </Card>
      </section>
    </main>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const ProcessPanelVariants = {
  Table: ProcessPanel,
  List: ProcessPanelList,
  Callout: ProcessPanelCallout,
  Grid: ProcessPanelGrid,
}
