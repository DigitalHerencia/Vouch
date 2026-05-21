"use client"

import {
  ComingSoonPage,
  ForbiddenPage,
  GenericErrorPage,
  MaintenancePage,
  NotFoundPage,
  OfflinePage,
  ServerErrorPage,
} from "@/components/blocks/error-pages"

export default function ErrorPages() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <NotFoundPage showSearch backHref="#" />
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
        <ComingSoonPage launchDate={new Date("2026-12-01T00:00:00")} onNotify={() => undefined} />
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
