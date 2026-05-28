import * as React from "react"
import { CheckCircle2, LockKeyhole, ShieldCheck, type LucideIcon } from "lucide-react"
import { CardHeader, Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { LogoLockup } from "@/components/brand/logo-lockup"
import { Marquee, MarqueeItem, MarqueeSeparator } from "@/components/ui/marquee"

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
      <CardHeader className="border-b-3 border-neutral-400 px-12 py-6">
        {eyebrow ? (
          <p className="text-lg font-black tracking-widest text-blue-600 uppercase md:text-base">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle className="text-6xl leading-none tracking-wide text-white">{title}</CardTitle>
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
            <p className="md:texy-base text-sm font-semibold tracking-widest text-blue-600 uppercase">
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
  detail?: string | undefined
  icon?: LucideIcon | undefined
}

export interface ProcessPanelGridProps {
  title?: string | undefined
  subtitle?: string | undefined
  logos: readonly ProcessPanelGridItem[]
  footer?: string | undefined
}

function ProcessPanelMarqueeTrack({
  logos,
  direction,
  className,
  itemClassName,
  separatorIcons,
}: {
  logos: readonly ProcessPanelGridItem[]
  direction: "left" | "right"
  className?: string | undefined
  itemClassName?: string | undefined
  separatorIcons?: readonly LucideIcon[] | undefined
}) {
  const icons = separatorIcons ?? [LockKeyhole, ShieldCheck, CheckCircle2]

  return (
    <Marquee
      direction={direction}
      speed="slow"
      pauseOnHover={false}
      repeat={1}
      className={[
        "relative z-0 border-x-0 border-y-3 border-neutral-400 bg-black select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {logos.map((item, index) => {
        const SeparatorIcon = icons[index % icons.length] ?? LockKeyhole

        return (
          <React.Fragment key={`${direction}-${item.name}`}>
            <MarqueeItem
              className={[
                "h-24 min-w-76 gap-5 border-3 border-neutral-400 bg-white px-6 text-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]",
                itemClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="flex h-12 min-w-36 items-center justify-center">{item.logo}</span>
              <span className="font-(family-name:--font-display) text-sm leading-none font-black tracking-wide text-black uppercase">
                {item.name}
              </span>
              {item.detail ? (
                <span className="font-mono text-xs leading-none font-black text-blue-600 uppercase">
                  {item.detail}
                </span>
              ) : null}
            </MarqueeItem>
            <MarqueeSeparator className="flex size-14 items-center justify-center border-3 border-neutral-400 bg-blue-600 text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <SeparatorIcon className="size-8" strokeWidth={2.4} />
            </MarqueeSeparator>
          </React.Fragment>
        )
      })}
    </Marquee>
  )
}

export function ProcessPanelGrid({ title, subtitle, logos, footer }: ProcessPanelGridProps) {
  const reversedLogos = [...logos].reverse()

  return (
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

      <CardContent className="space-y-5 overflow-hidden p-0 py-5">
        <ProcessPanelMarqueeTrack logos={logos} direction="left" />
        <ProcessPanelMarqueeTrack logos={reversedLogos} direction="right" />
      </CardContent>

      {footer ? (
        <CardFooter className="border-t-3 border-neutral-400 bg-blue-600 px-5 py-5 md:px-8">
          <h3 className="leading-none font-black tracking-wide text-white">{footer}</h3>
        </CardFooter>
      ) : null}
    </Card>
  )
}

const authProcessLogos: readonly ProcessPanelGridItem[] = [
  {
    name: "Vouch",
    detail: "authenticated",
    logo: (
      <LogoLockup iconClassName="size-7 text-blue-600" textClassName="text-[22px] text-black" />
    ),
  },
  {
    name: "Vouch mark",
    detail: "readiness",
    logo: (
      <span
        aria-label="Vouch"
        role="img"
        className="block h-10 w-36 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/logo-light.png)" }}
      />
    ),
  },
  {
    name: "Stripe Connect",
    detail: "provider-backed",
    logo: (
      <span
        aria-label="Stripe"
        role="img"
        className="block h-10 w-28 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Stripe wordmark - Blurple.svg)" }}
      />
    ),
  },
  {
    name: "Powered by Stripe",
    detail: "manual capture",
    logo: (
      <span
        aria-label="Powered by Stripe"
        role="img"
        className="block h-10 w-36 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Powered by Stripe - blurple.svg)" }}
      />
    ),
  },
  {
    name: "Presence window",
    detail: "deterministic",
    logo: (
      <LogoLockup iconClassName="size-7 text-blue-600" textClassName="text-[22px] text-black" />
    ),
  },
]

export function AuthProcessPanelGrid() {
  const reversedLogos = [...authProcessLogos].reverse()

  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 overflow-hidden py-10">
      <ProcessPanelMarqueeTrack
        logos={authProcessLogos}
        direction="right"
        className="-ml-10 w-[120%]"
        itemClassName="h-20 min-w-72"
      />
      <ProcessPanelMarqueeTrack
        logos={reversedLogos}
        direction="left"
        className="-ml-16 w-[132%]"
        itemClassName="h-32 min-w-96 px-8"
      />
      <ProcessPanelMarqueeTrack
        logos={authProcessLogos}
        direction="right"
        className="-ml-10 w-[120%]"
        itemClassName="h-20 min-w-72"
      />
    </div>
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
