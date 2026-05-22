import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { CardHeader, Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"

// ============================================================================
// Process Panel VARIANT 1: Table with Icons
// ============================================================================

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
    <Card id={id} className="w-full border-3 border-neutral-400 bg-black">
      <CardHeader className="items-center border-b-3 border-neutral-400 px-6 py-6 text-center md:px-8">
        <CardTitle>
          <h3 className="leading-none tracking-wide text-white">{title}</h3>
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
                    <h5 className="font-extrabold">{step.number}</h5>
                  </div>

                  <div>
                    <h3 className="tracking-normal text-white">{step.title}</h3>
                    <p className="font-semibold text-neutral-400">{step.body}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center border-l-3 border-neutral-400">
                  <Icon className="size-14 text-white md:size-16" strokeWidth={1.8} />
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
  )
}

// ============================================================================
// Process Panel VARIANT 2: Stacked Legal Rows
// ============================================================================
export interface ProcessPanelListItem {
  number: string
  title: string
  body: string
}

export interface ProcessPanelListProps {
  title: string
  items: readonly ProcessPanelListItem[]
  eyebrow?: string | undefined
  body?: string | undefined
  id?: string | undefined
}

export function ProcessPanelList({ title, items, eyebrow, body, id }: ProcessPanelListProps) {
  return (
    <Card id={id} className="w-full border-3 border-neutral-400 bg-black">
      <CardHeader className="border-b-3 border-neutral-400 px-6 py-6 md:px-8">
        {eyebrow ? (
          <p className="text-sm font-black tracking-widest text-blue-600 uppercase md:text-base">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle>
          <h2 className="leading-none tracking-wide text-white">{title}</h2>
        </CardTitle>
        {body ? <p className="font-semibold tracking-tight text-neutral-400">{body}</p> : null}
      </CardHeader>

      <CardContent className="p-0">
        {items.map((item) => (
          <section
            key={`${item.number}-${item.title}`}
            className="border-b-3 border-neutral-400 px-6 py-7 last:border-b-0 md:px-8 md:py-8"
          >
            <h4 className="tracking-normal text-white">
              {item.number}. {item.title}
            </h4>
            <p className="font-semibold text-neutral-400">{item.body}</p>
          </section>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Process Panel VARIANT 3: Rule Grid
// ============================================================================
export interface ProcessPanelRuleItem {
  label: string
  value: string
}

export interface ProcessPanelRuleGridProps {
  title: string
  items: readonly ProcessPanelRuleItem[]
  footer?: string | undefined
  id?: string | undefined
}

export function ProcessPanelRuleGrid({ title, items, footer, id }: ProcessPanelRuleGridProps) {
  return (
    <Card id={id} className="w-full border-3 border-neutral-400 bg-black">
      <CardHeader className="items-center border-b-3 border-neutral-400 px-8 py-8 text-center">
        <CardTitle>
          {" "}
          <h2 className="leading-none font-black tracking-wide text-white">{title}</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid p-0 md:grid-cols-2">
        {items.map((item, index) => (
          <section
            key={`${item.label}-${item.value}`}
            className={[
              "min-h-35 border-b-3 border-neutral-400 px-6 py-6 md:px-8",
              index % 2 === 0 ? "md:border-r-3" : "",
              index >= items.length - 2 ? "md:border-b-0" : "",
              index === items.length - 1 ? "border-b-0" : "",
            ].join(" ")}
          >
            <p className="md:texy-base text-sm font-semibold tracking-widest text-blue-600 uppercase">
              {item.label}
            </p>
            <h4 className="tracking-normal text-white">{item.value}</h4>
          </section>
        ))}
      </CardContent>

      {footer ? (
        <CardFooter className="justify-center bg-blue-600 px-6 py-6 text-center">
          <h3 className="font-black tracking-wide text-white">{footer}</h3>
        </CardFooter>
      ) : null}
    </Card>
  )
}

// ============================================================================
// Process Panel VARIANT 4: Callout
// ============================================================================
export interface ProcessPanelCalloutProps {
  title: string
  body: string
  action: string
  icon: LucideIcon
  id?: string | undefined
}

export function ProcessPanelCallout({
  title,
  body,
  action,
  icon: Icon,
  id,
}: ProcessPanelCalloutProps) {
  return (
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
  )
}

// ============================================================================
// Process Panel VARIANT 5: Bordered Content Grid
// ============================================================================
export interface ProcessPanelGridItem {
  name: string
  logo: React.ReactNode
}

export interface ProcessPanelGridProps {
  title?: string | undefined
  subtitle?: string | undefined
  logos: readonly ProcessPanelGridItem[]
}

export function ProcessPanelGrid({ title, subtitle, logos }: ProcessPanelGridProps) {
  return (
    <Card className="w-full border-3 border-neutral-400 bg-black">
      {(title || subtitle) && (
        <CardHeader className="items-center border-b-3 border-neutral-400 px-6 py-6 text-center md:px-8">
          {subtitle ? (
            <p className="md:base text-sm font-semibold tracking-widest text-blue-600 uppercase">
              {subtitle}
            </p>
          ) : null}
          {title ? (
            <CardTitle>
              <h3 className="leading-none font-black tracking-wide text-white">{title}</h3>
            </CardTitle>
          ) : null}
        </CardHeader>
      )}

      <CardContent className="grid grid-cols-2 p-0">
        {logos.map((item, index) => (
          <div
            key={item.name}
            className={[
              "flex min-h-28 items-center justify-center border-b-3 border-neutral-400 p-6 text-center",
              index % 2 === 0 ? "border-r-3" : "",
              index % 4 !== 3 ? "md:border-r-3" : "md:border-r-0",
              index >= logos.length - 2 ? "border-b-0" : "",
              index >= logos.length - 4 ? "md:border-b-0" : "",
            ].join(" ")}
          >
            {item.logo}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const ProcessPanelVariants = {
  Table: ProcessPanel,
  List: ProcessPanelList,
  RuleGrid: ProcessPanelRuleGrid,
  Callout: ProcessPanelCallout,
  Grid: ProcessPanelGrid,
}
