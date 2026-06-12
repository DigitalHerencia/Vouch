type AuthAction = { label: string; href?: string; onClick?: () => void }

type CTAAction = AuthAction

type CTASimpleProps = {
  title: string
  description?: string
  primaryAction?: CTAAction | undefined
  secondaryAction?: CTAAction | undefined
}

type CTAWithBackgroundProps = CTASimpleProps & {
  variant?: "primary" | "secondary" | "accent" | "muted"
  icon?: React.ReactNode
  backgroundColor?: "primary" | "secondary" | "accent" | "muted"
}

import { CheckCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "../ui/button"

const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-vouch-xl"

export function CTAWithBackground({
  icon,
  title,
  description,
  primaryAction,
  backgroundColor = "primary",
}: CTAWithBackgroundProps) {
  const bgColors: Record<NonNullable<CTAWithBackgroundProps["backgroundColor"]>, string> = {
    primary: "bg-blue-600/10 text-white",
    secondary: "bg-black text-white",
    accent: "bg-blue-600 text-white",
    muted: "bg-black/90 text-white",
  }

  return (
    <section>
      <div
        className={`border-3 border-neutral-400 p-8 shadow-vouch-lg backdrop-blur-3xl md:p-12 ${cardMotion} ${bgColors[backgroundColor]}`}
      >
        <div className="space-y-6 text-center">
          <div>{icon ?? <CheckCircle className="mx-auto h-12 w-12" />}</div>
          <h2 className="font-black">{title}</h2>
          {description ? (
            <p className="mx-auto max-w-3xl text-base leading-7 font-medium text-white md:text-lg">
              {description}
            </p>
          ) : null}
          {primaryAction ? (
            <div>
              {primaryAction.href ? (
                <Button size="lg" variant="default" asChild>
                  <Link href={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              ) : (
                <Button size="lg" variant="default" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
