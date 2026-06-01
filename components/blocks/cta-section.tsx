import * as React from "react"
import { CheckCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:")) return href

  try {
    const url = new URL(href)
    return url.protocol === "https:" ? href : "#"
  } catch {
    return "#"
  }
}

function CTAButton({
  action,
  variant = "default",
}: {
  action: CTAAction
  variant?: "default" | "outline"
}) {
  if (action.href) {
    return (
      <Button size="lg" variant="outline" asChild>
        <Link href={safeHref(action.href)}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button size="lg" variant="outline" onClick={action.onClick}>
      {action.label}
    </Button>
  )
}

export function CTASimple({ title, description, primaryAction, secondaryAction }: CTASimpleProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="space-y-6 text-center">
          <h1 className="font-black">{title}</h1>
          {description ? (
            <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
          ) : null}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <CTAButton action={primaryAction} />
            {secondaryAction ? <CTAButton action={secondaryAction} variant="outline" /> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

export function CTAWithBackground({
  icon,
  title,
  description,
  primaryAction,
  backgroundColor = "primary",
}: CTAWithBackgroundProps) {
  const bgColors = {
    primary: "bg-blue-600/10 text-white",
    secondary: "bg-black text-white",
    accent: "bg-blue-600 text-white",
    muted: "bg-black/90 text-white",
  }

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div
          className={`border-3 border-neutral-400 p-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] backdrop-blur-3xl md:p-12 ${cardMotion} ${bgColors[backgroundColor]}`}
        >
          <div className="space-y-6 text-center">
            <div>{icon ?? <CheckCircle className="mx-auto h-12 w-12" />}</div>
            <h1 className="font-black">{title}</h1>
            {description ? (
              <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
            ) : null}
            {primaryAction && (
              <div>
                {primaryAction &&
                  (primaryAction.href ? (
                    <Button size="lg" variant="default" asChild>
                      <Link href={primaryAction.href}>{primaryAction.label}</Link>
                    </Button>
                  ) : (
                    <Button size="lg" variant="default" onClick={primaryAction.onClick}>
                      {primaryAction.label}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export function CTANewsletter({
  title,
  description,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
  email,
  onEmailChange,
  onSubmit,
}: CTANewsletterProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="space-y-6 text-center">
          <Mail className="mx-auto h-16 w-16 text-blue-600" />
          <h2 className="font-black">{title}</h2>
          {description ? <p className="font-medium text-neutral-400">{description}</p> : null}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit?.()
            }}
            className="mx-auto flex max-w-2xl flex-col gap-3 md:flex-row"
          >
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" size="lg">
              {buttonLabel}
            </Button>
          </form>
          <p className="md:base text-xs text-neutral-400">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  )
}

export function CTASplit({
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt = "CTA image",
  imagePosition = "right",
}: CTASplitProps) {
  const contentOrder = imagePosition === "right" ? "order-1" : "order-2"
  const imageOrder = imagePosition === "right" ? "order-2" : "order-1"

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="overflow-hidden border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
          <div className="grid md:grid-cols-2">
            <div className={`flex flex-col justify-center space-y-6 p-8 md:p-12 ${contentOrder}`}>
              <h3 className="font-black">{title}</h3>
              {description ? <p className="font-medium text-white">{description}</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton action={primaryAction} />
                {secondaryAction ? <CTAButton action={secondaryAction} variant="outline" /> : null}
              </div>
            </div>
            <div className={`bg-white ${imageOrder}`}>
              <span
                aria-label={imageAlt}
                role="img"
                className="block h-full min-h-80 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${imageSrc})` }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function CTABanner({
  text,
  action,
  dismissible = false,
  isVisible = true,
  onDismiss,
  variant = "primary",
}: CTABannerProps) {
  const variantStyles = {
    primary: "bg-black text-white",
    secondary: "bg-black text-white",
    accent: "bg-blue-600/10 text-white",
    warning: "bg-red-600/10 text-white",
  }

  if (!isVisible) return null

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div
          className={`relative border-b-3 border-neutral-400 px-4 py-3 ${variantStyles[variant]}`}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-sm font-bold">{text}</p>
            {action.href ? (
              <Button size="sm" variant="outline" className="shrink-0" asChild>
                <Link href={safeHref(action.href)}>{action.label}</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="shrink-0" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {dismissible ? (
              <button
                type="button"
                aria-label="Dismiss"
                onClick={onDismiss}
                className="absolute right-4 text-white opacity-70 hover:opacity-100"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

export const CTASection = {
  Simple: CTASimple,
  WithBackground: CTAWithBackground,
  Newsletter: CTANewsletter,
  Split: CTASplit,
  Banner: CTABanner,
}
