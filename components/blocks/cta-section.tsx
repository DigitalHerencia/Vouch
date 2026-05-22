"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { safeHref } from "@/lib/utils"
import { ArrowRight, CheckCircle, CheckCircle2, Mail, Sparkles, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// ============================================================================
// CTA VARIANT 1: Simple Centered
// ============================================================================
export interface CTASimpleProps {
  title: string
  description?: string
  primaryAction: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}

export function CTASimple({ title, description, primaryAction, secondaryAction }: CTASimpleProps) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto space-y-6 text-center">
        <h1 className="font-black">{title}</h1>

        {description && (
          <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {primaryAction.href ? (
            <Button size="lg" asChild>
              <a href={safeHref(primaryAction.href)}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="lg" onClick={primaryAction.onClick}>
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button size="lg" variant="outline" asChild>
                <a href={safeHref(secondaryAction.href)}>{secondaryAction.label}</a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA VARIANT 2: With Background
// ============================================================================
export interface CTAWithBackgroundProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryAction: { label: string; href?: string; onClick?: () => void }
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
          {icon || <CheckCircle className="mx-auto h-12 w-12" />}

          <h1 className="font-black">{title}</h1>

          {description && (
            <p className="mx-auto text-base font-medium text-white md:text-lg">{description}</p>
          )}

          {primaryAction.href ? (
            <Button size="lg" variant="outline" asChild>
              <Link href={safeHref(primaryAction.href)}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={primaryAction.onClick}>
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA VARIANT 3: Newsletter
// ============================================================================
export interface CTANewsletterProps {
  title: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  onSubmit?: (email: string) => void
}

export function CTANewsletter({
  title,
  description,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
  onSubmit,
}: CTANewsletterProps) {
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(email)
    setEmail("")
  }

  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <Mail className="mx-auto h-16 w-16 text-blue-600" />

        <h2 className="font-black">{title}</h2>

        {description && <p className="font-medium text-neutral-400">{description}</p>}

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-3 md:flex-row">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

// ============================================================================
// CTA VARIANT 4: Split with Image
// ============================================================================
export interface CTASplitProps {
  title: string
  description?: string
  primaryAction: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
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
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className={"grid md:grid-cols-2"}>
          <div className="flex flex-col justify-center space-y-6 p-8 md:p-12">
            <h3 className="font-black">{title}</h3>

            {description && <p className="font-medium text-white">{description}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryAction.href ? (
                <Button size="lg" asChild>
                  <Link href={safeHref(primaryAction.href)}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {secondaryAction &&
                (secondaryAction.href ? (
                  <Button size="lg" variant="outline" asChild>
                    <a href={safeHref(secondaryAction.href)}>{secondaryAction.label}</a>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                ))}
            </div>
          </div>

          <div className="bg-white">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={960}
              height={720}
              className="h-full object-center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA VARIANT 5: Banner
// ============================================================================
export interface CTABannerProps {
  text: string
  action: { label: string; href?: string; onClick?: () => void }
  dismissible?: boolean
  onDismiss?: () => void
  variant?: "primary" | "secondary" | "accent" | "warning"
}

export function CTABanner({
  text,
  action,
  dismissible = false,
  onDismiss,
  variant = "primary",
}: CTABannerProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  const variantStyles = {
    primary: "bg-black text-white",
    secondary: "bg-black text-white",
    accent: "bg-blue-600/10 text-white",
    warning: "bg-red-600/10 text-white",
  }

  if (!isVisible) return null

  return (
    <div className={`relative border-b-3 border-neutral-400 px-4 py-3 ${variantStyles[variant]}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
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
        {dismissible && (
          <button
            aria-label="Dismiss"
            onClick={() => {
              setIsVisible(false)
              onDismiss?.()
            }}
            className="absolute right-4 text-white opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const CTASection = {
  Simple: CTASimple,
  WithBackground: CTAWithBackground,
  Newsletter: CTANewsletter,
  Split: CTASplit,
  Banner: CTABanner,
}
