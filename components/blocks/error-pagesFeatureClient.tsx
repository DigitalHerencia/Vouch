"use client"

import * as React from "react"
import {
  ComingSoonPage,
  ForbiddenPage,
  GenericErrorPage,
  MaintenancePage,
  NotFoundPage,
  OfflinePage,
  ServerErrorPage,
  getErrorPageCountdown,
} from "@/components/blocks/error-pages"

export function ErrorPagesFeatureClient() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const launchDate = React.useMemo(() => new Date("2026-12-01T00:00:00"), [])
  const [timeRemaining, setTimeRemaining] = React.useState(() => getErrorPageCountdown(launchDate))

  React.useEffect(() => {
    const interval = window.setInterval(
      () => setTimeRemaining(getErrorPageCountdown(launchDate)),
      1000
    )
    return () => window.clearInterval(interval)
  }, [launchDate])

  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <NotFoundPage
          showSearch
          backHref="#"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        <ServerErrorPage
          errorId="ERR-500-VOUCH"
          onRetry={() => undefined}
          supportEmail="support@example.com"
        />
        <MaintenancePage
          estimatedTime="45 minutes"
          features={["Payment reconciliation", "Webhook retries", "Status updates"]}
          statusPageUrl="#"
        />
        <OfflinePage onRetry={() => undefined} />
        <ForbiddenPage loginHref="#" />
        <ComingSoonPage
          launchDate={launchDate}
          email={email}
          onEmailChange={setEmail}
          submitted={submitted}
          timeRemaining={timeRemaining}
          onNotify={() => setSubmitted(true)}
        />
        <GenericErrorPage
          title="Payment State Unavailable"
          description="We could not retrieve provider-backed payment state."
          actions={[
            { label: "Retry", variant: "default" },
            { label: "Home", href: "#", variant: "outline" },
          ]}
        />
      </section>
    </main>
  )
}
