type ProcessPanelStep = {
  number?: string
  label?: string
  value?: string
  title?: string
  body?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

type ProcessPanelRuleGridProps = {
  title?: string
  items: readonly ProcessPanelStep[]
  footer?: string | React.ReactNode
  id?: string
}

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const panelMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-vouch-xl"

export function ProcessPanelRuleGrid({ title, items, footer, id }: ProcessPanelRuleGridProps) {
  return (
    <section>
      <Card id={id} className={`w-full border-3 border-neutral-400 bg-black ${panelMotion}`}>
        <CardHeader className="items-center border-b-3 border-neutral-400 px-6 py-6 text-center">
          <CardTitle className="text-6xl font-black tracking-wide text-white">{title}</CardTitle>
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
              <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
                {item.label}
              </p>
              <h3 className="tracking-normal text-white">{item.value}</h3>
            </section>
          ))}
        </CardContent>

        {footer ? (
          <CardFooter className="justify-center bg-blue-600 px-6 py-6 text-center">
            <h3 className="font-black tracking-wide text-white">{footer}</h3>
          </CardFooter>
        ) : null}
      </Card>
    </section>
  )
}
