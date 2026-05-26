import * as React from "react"
import { ArrowRight, CheckCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:")) return href

  try {
    const url = new URL(href)
    return url.protocol === "https:" ? href : "#"
  } catch {
    return "#"
  }
}

export interface CTAAction {
  label: string
  href?: string
  onClick?: () => void
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
      <Button size="lg" variant={variant} asChild>
        <a href={safeHref(action.href)}>
          {action.label}
          {variant === "default" ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </a>
      </Button>
    )
  }

  return (
    <Button size="lg" variant={variant} onClick={action.onClick}>
      {action.label}
      {variant === "default" ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
    </Button>
  )
}

export interface CTASimpleProps {
  title: string
  description?: string
  primaryAction: CTAAction
  secondaryAction?: CTAAction
}

export function CTASimple({ title, description, primaryAction, secondaryAction }: CTASimpleProps) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto space-y-6 text-center">
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
  )
}

export interface CTAWithBackgroundProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryAction: CTAAction
  backgroundColor?: "primary" | "secondary" | "accent" | "muted"
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
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div
        className={`mx-auto max-w-5xl border-3 border-neutral-400 p-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:p-12 ${bgColors[backgroundColor]}`}
      >
        <div className="space-y-6 text-center">
          {icon ?? <CheckCircle className="mx-auto h-12 w-12" />}
          <h1 className="font-black">{title}</h1>
          {description ? (
            <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
          ) : null}
          <CTAButton action={primaryAction} variant="outline" />
        </div>
      </div>
    </section>
  )
}

export interface CTANewsletterProps {
  title: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  email: string
  onEmailChange: (email: string) => void
  onSubmit?: () => void
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
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
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
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <p className="md:base text-xs text-neutral-400">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}

export interface CTASplitProps {
  title: string
  description?: string
  primaryAction: CTAAction
  secondaryAction?: CTAAction
  imageSrc: string
  imageAlt?: string
  imagePosition?: "left" | "right"
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
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
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
  )
}

export interface CTABannerProps {
  text: string
  action: CTAAction
  dismissible?: boolean
  isVisible?: boolean
  onDismiss?: () => void
  variant?: "primary" | "secondary" | "accent" | "warning"
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
    <div className={`relative border-b-3 border-neutral-400 px-4 py-3 ${variantStyles[variant]}`}>
      <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-bold">{text}</p>
        {action.href ? (
          <Button size="sm" variant="outline" className="shrink-0" asChild>
            <a href={safeHref(action.href)}>
              {action.label}
              <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="shrink-0" onClick={action.onClick}>
            {action.label}
            <ArrowRight className="ml-1 h-3 w-3" />
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
  )
}

export const CTASection = {
  Simple: CTASimple,
  WithBackground: CTAWithBackground,
  Newsletter: CTANewsletter,
  Split: CTASplit,
  Banner: CTABanner,
}
