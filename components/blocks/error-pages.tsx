import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, Construction, Wifi, Ban, Clock, Lock, RefreshCw } from "lucide-react"
import type {
  ComingSoonPageProps,
  ForbiddenPageProps,
  MaintenancePageProps,
  OfflinePageProps,
} from "@/types/commonTypes"
function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:")) return href

  try {
    const url = new URL(href)
    return url.protocol === "https:" ? href : "#"
  } catch {
    return "#"
  }
}

export function MaintenancePage({
  title = "Under Maintenance",
  description = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
  features,
  statusPageUrl,
}: MaintenancePageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Construction className="h-12 w-12 text-white" />
        </div>

        <div className="space-y-4">
          <h2 className="font-black">{title}</h2>
          <p className="text-base text-white md:text-lg">{description}</p>

          {estimatedTime && (
            <div className="inline-flex items-center gap-2 border-3 border-neutral-400 bg-black px-4 py-2 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <Clock className="h-5 w-5" />
              <span className="font-bold">Estimated time: {estimatedTime}</span>
            </div>
          )}
        </div>

        {features && features.length > 0 && (
          <div className="space-y-3 border-3 border-neutral-400 bg-black p-6 text-left shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
            <h3 className="font-bold">What we're working on:</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={`feature-${index}`} className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-white">
                    ✓
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {statusPageUrl && (
          <Button variant="outline" asChild>
            <a href={safeHref(statusPageUrl)} target="_blank" rel="noopener noreferrer">
              Check Status Page
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

export function OfflinePage({
  title = "You're Offline",
  description = "It looks like you've lost your internet connection. Please check your connection and try again.",
  onRetry,
}: OfflinePageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Wifi className="h-12 w-12 text-neutral-400" />
        </div>

        <div className="space-y-4">
          <h2 className="font-black">{title}</h2>
          <p className="text-white">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="border-3 border-neutral-400 bg-black p-4 text-left shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
            <h4 className="font-bold">Things to try:</h4>
            <ul className="mt-2 space-y-1 text-sm text-white md:text-base">
              <li>• Check your Wi-Fi connection</li>
              <li>• Restart your router</li>
              <li>• Try disabling VPN if you're using one</li>
            </ul>
          </div>

          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ForbiddenPage({
  title = "403",
  description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  homeHref = "/",
  loginHref,
}: ForbiddenPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 403 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-neutral-400/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-red-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <Ban className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-black">Access Denied</h2>
          <p className="text-white">{description}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
          {loginHref && (
            <Button variant="outline" asChild>
              <a href={safeHref(loginHref)}>
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR PAGE VARIANT 6: Coming Soon
// ============================================================================

export function getErrorPageCountdown(launchDate?: Date) {
  if (!launchDate) return null
  const total = launchDate.getTime() - Date.now()
  if (total <= 0) return null

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
  }
}

export function ComingSoonPage({
  title = "Coming Soon",
  description = "We're working hard to bring you something amazing. Stay tuned!",
  onNotify,
  email = "",
  onEmailChange,
  submitted = false,
  timeRemaining,
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Clock className="h-16 w-16 text-white" />
        </div>

        <div className="space-y-4">
          <h2 className="font-black">{title}</h2>
          <p className="text-base text-white md:text-lg">{description}</p>
        </div>

        {timeRemaining ? (
          <div className="flex justify-center gap-4">
            {[
              { value: timeRemaining.days, label: "Days" },
              { value: timeRemaining.hours, label: "Hours" },
              { value: timeRemaining.minutes, label: "Minutes" },
            ].map((item) => (
              <div
                key={`action-${item.label}`}
                className="w-24 border-3 border-neutral-400 bg-black p-4 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]"
              >
                <p className="text-3xl font-black">{item.value}</p>
                <p className="text-xs font-bold text-neutral-400 uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {onNotify && !submitted ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onNotify(email)
            }}
            className="mx-auto flex max-w-xs flex-col gap-4"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => onEmailChange?.(event.target.value)}
              required
              className="border-2 border-neutral-400 p-5"
            />
            <Button type="submit" variant="outline" size="sm">
              Notify Me
            </Button>
          </form>
        ) : null}

        {submitted ? (
          <div className="border-3 border-neutral-400 bg-blue-600/10 p-4">
            <p className="font-bold text-white">Thanks! We'll notify you when we launch.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const ErrorPages = {
  Maintenance: MaintenancePage,
  Offline: OfflinePage,
  Forbidden: ForbiddenPage,
  ComingSoon: ComingSoonPage,
}
